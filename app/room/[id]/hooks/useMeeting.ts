"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  VideoPresets,
  type RoomOptions,
  type RemoteTrackPublication,
} from "livekit-client";
import { getAccessToken } from "@/lib/api";

// ── Types (same interface as before — page.tsx is unchanged) ──────────────────

export interface Participant {
  socketId: string;        // LiveKit participant.sid
  userId: string;          // LiveKit participant.identity (our userId)
  name: string;
  avatarUrl?: string;
  stream?: MediaStream;
  videoEnabled: boolean;
  audioEnabled: boolean;
  connectionState: RTCPeerConnectionState;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

// ── Token fetch ───────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchLiveKitToken(
  roomName: string,
): Promise<{ token: string; url: string }> {
  const jwt = getAccessToken();
  const res = await fetch(
    `${API_BASE}/meetings/${encodeURIComponent(roomName)}/token`,
    { headers: { Authorization: `Bearer ${jwt}` } },
  );
  if (!res.ok) throw new Error(`Token request failed (${res.status})`);
  const body = await res.json();
  return body?.data ?? body;
}

// ── Stream helpers ────────────────────────────────────────────────────────────

// Build or update a stable MediaStream from a remote participant's subscribed
// tracks. We mutate an existing stream object rather than creating a new one
// each time so the <video> element's srcObject reference stays stable.
function syncParticipantStream(
  p: RemoteParticipant,
  cache: Map<string, MediaStream>,
): MediaStream | undefined {
  const tracks: MediaStreamTrack[] = [];
  p.trackPublications.forEach((pub) => {
    const rtp = pub as RemoteTrackPublication;
    // Skip screen-share tracks — they're shown in the sharer's local tile
    if (pub.source === Track.Source.ScreenShare) return;
    if (rtp.isSubscribed && pub.track?.mediaStreamTrack) {
      tracks.push(pub.track.mediaStreamTrack);
    }
  });

  if (tracks.length === 0) {
    cache.delete(p.sid);
    return undefined;
  }

  let stream = cache.get(p.sid);
  if (!stream) {
    stream = new MediaStream(tracks);
    cache.set(p.sid, stream);
    return stream;
  }

  // Mutate the existing stream — add new tracks, drop stale ones
  const existing = new Set(stream.getTracks());
  const incoming = new Set(tracks);
  existing.forEach((t) => { if (!incoming.has(t)) stream!.removeTrack(t); });
  tracks.forEach((t) => { if (!existing.has(t)) stream!.addTrack(t); });
  return stream;
}

function toParticipant(
  p: RemoteParticipant,
  cache: Map<string, MediaStream>,
): Participant {
  return {
    socketId: p.sid,
    userId: p.identity,
    name: p.name || p.identity,
    avatarUrl: undefined,
    stream: syncParticipantStream(p, cache),
    videoEnabled: p.isCameraEnabled,
    audioEnabled: p.isMicrophoneEnabled,
    connectionState: "connected",
  };
}

// ── useMeeting hook ───────────────────────────────────────────────────────────

export function useMeeting(meetingId: string) {
  const router = useRouter();

  // React state — drives the UI
  const [participants,    setParticipants]    = useState<Participant[]>([]);
  const [localStream,     setLocalStream]     = useState<MediaStream | null>(null);
  const [connecting,      setConnecting]      = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [micOn,           setMicOn]           = useState(true);
  const [camOn,           setCamOn]           = useState(true);
  const [sharing,         setSharing]         = useState(false);
  const [messages,        setMessages]        = useState<ChatMessage[]>([]);
  const [unread,          setUnread]          = useState(0);
  const [myUserId,        setMyUserId]        = useState("");

  // Stable refs — never stale in callbacks
  const roomRef        = useRef<Room | null>(null);
  const streamCacheRef = useRef<Map<string, MediaStream>>(new Map());
  const localCamStream = useRef<MediaStream | null>(null); // always the camera
  const screenStream   = useRef<MediaStream | null>(null); // screen share only
  const chatOpenRef    = useRef(false);
  const mountedRef     = useRef(true);

  // ── Sync helpers ────────────────────────────────────────────────────────────

  const syncRemoteParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room || !mountedRef.current) return;
    setParticipants(
      Array.from(room.remoteParticipants.values()).map((p) =>
        toParticipant(p, streamCacheRef.current),
      ),
    );
  }, []);

  // Rebuild the camera/mic stream from the local participant's current tracks.
  // Also captures the screen-share track reference when screen sharing.
  const syncLocalStream = useCallback(() => {
    const room = roomRef.current;
    if (!room || !mountedRef.current) return;

    const camTracks: MediaStreamTrack[]    = [];
    const screenTracks: MediaStreamTrack[] = [];

    room.localParticipant.trackPublications.forEach((pub) => {
      if (!pub.track?.mediaStreamTrack) return;
      if (pub.source === Track.Source.ScreenShare) {
        screenTracks.push(pub.track.mediaStreamTrack);
      } else {
        camTracks.push(pub.track.mediaStreamTrack);
      }
    });

    const cam = camTracks.length > 0 ? new MediaStream(camTracks) : null;
    localCamStream.current = cam;
    setLocalStream(cam);

    screenStream.current =
      screenTracks.length > 0 ? new MediaStream(screenTracks) : null;
  }, []);

  // ── Core effect ─────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    const roomOptions: RoomOptions = {
      adaptiveStream: true,   // auto-adjust quality based on viewport / bandwidth
      dynacast: true,         // only publish at quality levels actually consumed
      videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    const room = new Room(roomOptions);
    roomRef.current = room;

    room
      .on(RoomEvent.Connected, () => {
        if (!mountedRef.current) return;
        setSocketConnected(true);
        setConnecting(false);
        setMyUserId(room.localParticipant.identity);
        syncRemoteParticipants();
      })
      .on(RoomEvent.Disconnected, () => {
        if (mountedRef.current) setSocketConnected(false);
      })
      .on(RoomEvent.Reconnecting, () => {
        if (mountedRef.current) setSocketConnected(false);
      })
      .on(RoomEvent.Reconnected, () => {
        if (!mountedRef.current) return;
        setSocketConnected(true);
        syncRemoteParticipants();
      })
      // Remote participant lifecycle
      .on(RoomEvent.ParticipantConnected,    syncRemoteParticipants)
      .on(RoomEvent.ParticipantDisconnected, syncRemoteParticipants)
      // Track lifecycle — re-sync so stream caches are up to date
      .on(RoomEvent.TrackSubscribed,   syncRemoteParticipants)
      .on(RoomEvent.TrackUnsubscribed, syncRemoteParticipants)
      .on(RoomEvent.TrackMuted,        syncRemoteParticipants)
      .on(RoomEvent.TrackUnmuted,      syncRemoteParticipants)
      // Local track lifecycle
      .on(RoomEvent.LocalTrackPublished,   syncLocalStream)
      .on(RoomEvent.LocalTrackUnpublished, syncLocalStream)
      // In-room chat via LiveKit data channel
      .on(RoomEvent.DataReceived, (payload) => {
        if (!mountedRef.current) return;
        try {
          const msg: ChatMessage = JSON.parse(new TextDecoder().decode(payload));
          setMessages((prev) => [...prev, msg]);
          if (!chatOpenRef.current) setUnread((c) => c + 1);
        } catch {}
      });

    const connect = async () => {
      try {
        const { token, url } = await fetchLiveKitToken(meetingId);
        await room.connect(url, token);
        // Publish camera + mic immediately after connecting
        await room.localParticipant.enableCameraAndMicrophone();
        syncLocalStream();
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        setConnecting(false);
        setConnectionError(
          err instanceof Error ? err.message : "Failed to connect",
        );
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      room.disconnect();
      roomRef.current = null;
    };
  }, [meetingId, syncRemoteParticipants, syncLocalStream]);

  // ── Controls ─────────────────────────────────────────────────────────────────

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOn;
    await room.localParticipant.setMicrophoneEnabled(next).catch(() => {});
    setMicOn(next);
  }, [micOn]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !camOn;
    await room.localParticipant.setCameraEnabled(next).catch(() => {});
    setCamOn(next);
    syncLocalStream();
  }, [camOn, syncLocalStream]);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !sharing;
    // LiveKit handles getDisplayMedia, track replacement, and cleanup internally.
    // The stale-closure / re-open bug from the old P2P implementation is gone.
    await room.localParticipant.setScreenShareEnabled(next).catch(() => {});
    setSharing(next);
    syncLocalStream();
  }, [sharing, syncLocalStream]);

  const sendMessage = useCallback((content: string) => {
    const room = roomRef.current;
    if (!content.trim() || !room) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: room.localParticipant.identity,
      senderName: room.localParticipant.name || "You",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    // Optimistic local add — DataReceived does NOT fire for own messages
    setMessages((prev) => [...prev, msg]);
    const encoded = new TextEncoder().encode(JSON.stringify(msg));
    room.localParticipant
      .publishData(encoded, { reliable: true })
      .catch(() => {});
  }, []);

  const leave = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    router.replace("/dashboard/home");
  }, [router]);

  const setChatOpen = useCallback((open: boolean) => {
    chatOpenRef.current = open;
    if (open) setUnread(0);
  }, []);

  // ── Return ───────────────────────────────────────────────────────────────────
  // localStream switches to screen capture while sharing;
  // rawLocalStream is always the camera (for PiP overlays etc.)

  return {
    participants,
    localStream: sharing && screenStream.current ? screenStream.current : localStream,
    rawLocalStream: localCamStream.current,
    connecting,
    connectionError,
    socketConnected,
    micOn,
    camOn,
    sharing,
    messages,
    unread,
    myUserId,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
    leave,
    setChatOpen,
  };
}
