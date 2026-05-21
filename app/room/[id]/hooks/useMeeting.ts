"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Participant {
  socketId: string;
  userId: string;
  name: string;
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

// ── ICE configuration ──────────────────────────────────────────────────────
// STUN: discovers public IP for direct P2P
// TURN: relays media when direct P2P fails (symmetric NAT / CGNAT on mobile)

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
      ],
    },
    {
      // Open Relay — free TURN relay, covers UDP/TCP/TLS for all NAT types
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:80?transport=tcp",
        "turn:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceTransportPolicy: "all",
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
};

// ── PeerManager ────────────────────────────────────────────────────────────
// Owns all RTCPeerConnection instances and ICE candidate queues.
// Completely decoupled from React — no state or hooks here.

class PeerManager {
  private peers = new Map<string, RTCPeerConnection>();
  private iceQueue = new Map<string, RTCIceCandidateInit[]>();

  create(id: string): RTCPeerConnection {
    this.close(id); // ensure no leftover
    const pc = new RTCPeerConnection(ICE_CONFIG);
    this.peers.set(id, pc);
    return pc;
  }

  get(id: string) { return this.peers.get(id); }
  has(id: string) { return this.peers.has(id); }

  close(id: string) {
    const pc = this.peers.get(id);
    if (pc) { try { pc.close(); } catch {} this.peers.delete(id); }
    this.iceQueue.delete(id);
  }

  closeAll() {
    this.peers.forEach((pc) => { try { pc.close(); } catch {} });
    this.peers.clear();
    this.iceQueue.clear();
  }

  replaceVideoTrack(track: MediaStreamTrack) {
    this.peers.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(track).catch(() => {});
    });
  }

  queueCandidate(id: string, c: RTCIceCandidateInit) {
    const q = this.iceQueue.get(id) ?? [];
    q.push(c);
    this.iceQueue.set(id, q);
  }

  async flushCandidates(id: string, pc: RTCPeerConnection) {
    const q = this.iceQueue.get(id) ?? [];
    this.iceQueue.delete(id);
    for (const c of q) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn(`[ICE] Buffered candidate failed (${id}):`, e); }
    }
  }
}

// ── useMeeting hook ────────────────────────────────────────────────────────

export function useMeeting(meetingId: string) {
  const router = useRouter();

  // ── React state (UI-facing only) ─────────────────────────────────────
  const [participants, setParticipants]     = useState<Participant[]>([]);
  const [localStream, setLocalStream]       = useState<MediaStream | null>(null);
  const [connecting, setConnecting]         = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [micOn, setMicOn]                   = useState(true);
  const [camOn, setCamOn]                   = useState(true);
  const [sharing, setSharing]               = useState(false);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [unread, setUnread]                 = useState(0);
  const [myUserId, setMyUserId]             = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // ── Mutable refs (never stale in callbacks) ──────────────────────────
  const socketRef       = useRef<Socket | null>(null);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerMgrRef      = useRef(new PeerManager());
  const chatOpenRef     = useRef(false);
  const mountedRef      = useRef(true);

  // ── Participant helpers (always read fresh from closure via setState) ─

  const upsertParticipant = (p: Participant) => {
    setParticipants((prev) => {
      const idx = prev.findIndex((x) => x.socketId === p.socketId);
      if (idx === -1) return [...prev, p];
      return prev.map((x) => (x.socketId === p.socketId ? { ...x, ...p } : x));
    });
  };

  const patchParticipant = (socketId: string, patch: Partial<Participant>) => {
    setParticipants((prev) =>
      prev.map((p) => (p.socketId === socketId ? { ...p, ...patch } : p)),
    );
  };

  const removeParticipant = (socketId: string) => {
    setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
  };

  // ── Build a peer connection with all event wiring ────────────────────
  // Uses refs for socket + streams so no stale closures.

  const buildPeer = useCallback(
    (socketId: string, isInitiator: boolean): RTCPeerConnection => {
      const peerMgr = peerMgrRef.current;
      const existing = peerMgr.get(socketId);
      if (existing && existing.connectionState !== "closed" && existing.connectionState !== "failed") {
        return existing;
      }

      const pc = peerMgr.create(socketId);

      // Add local media tracks (always via ref, never stale)
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => {
          try { pc.addTrack(t, stream); } catch {}
        });
      }

      // ICE candidate → emit to signaling server
      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) { console.log(`[ICE ${socketId.slice(0,8)}] Gathering complete`); return; }
        console.log(`[ICE ${socketId.slice(0,8)}] Candidate type=${candidate.type} proto=${candidate.protocol}`);
        socketRef.current?.emit("meeting:ice-candidate", {
          meetingId, targetSocketId: socketId,
          candidate: candidate.toJSON(),
        });
      };

      // Remote track → attach stream to participant tile
      pc.ontrack = ({ streams, track }) => {
        console.log(`[Track ${socketId.slice(0,8)}] kind=${track.kind} streams=${streams.length}`);
        const remoteStream = streams[0] ?? new MediaStream([track]);
        // Ensure tile exists then attach stream
        setParticipants((prev) => {
          const exists = prev.some((p) => p.socketId === socketId);
          if (!exists) return prev; // tile will be created by participant-joined
          return prev.map((p) => p.socketId === socketId ? { ...p, stream: remoteStream } : p);
        });
      };

      // Connection state monitoring + ICE restart
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[Peer ${socketId.slice(0,8)}] connectionState → ${state}`);
        patchParticipant(socketId, { connectionState: state });

        if (state === "failed" && isInitiator) {
          console.warn(`[Peer ${socketId.slice(0,8)}] Connection failed — restarting ICE`);
          pc.restartIce();
          pc.createOffer({ iceRestart: true })
            .then((o) => pc.setLocalDescription(o))
            .then(() => {
              socketRef.current?.emit("meeting:offer", {
                meetingId, targetSocketId: socketId, sdp: pc.localDescription,
              });
            }).catch(console.warn);
        }
      };

      pc.oniceconnectionstatechange = () => {
        const s = pc.iceConnectionState;
        console.log(`[ICE ${socketId.slice(0,8)}] iceConnectionState → ${s}`);
        if (s === "failed") { pc.restartIce(); console.warn(`[ICE] Restart triggered for ${socketId.slice(0,8)}`); }
        if (s === "connected" || s === "completed") console.log(`[ICE ${socketId.slice(0,8)}] ✓ Connected`);
      };

      pc.onicegatheringstatechange = () =>
        console.log(`[ICE ${socketId.slice(0,8)}] gatheringState → ${pc.iceGatheringState}`);

      // Initiator creates and sends offer
      if (isInitiator) {
        pc.createOffer()
          .then((o) => pc.setLocalDescription(o))
          .then(() => {
            console.log(`[Offer → ${socketId.slice(0,8)}]`);
            socketRef.current?.emit("meeting:offer", {
              meetingId, targetSocketId: socketId, sdp: pc.localDescription,
            });
          }).catch((e) => console.error(`[Offer] Failed for ${socketId.slice(0,8)}:`, e));
      }

      return pc;
    },
    [meetingId],
  );

  // ── Core effect: media → socket → room ───────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    const run = async () => {
      // 1. Acquire media before connecting socket (tracks must exist before addTrack)
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          if (mountedRef.current) setCamOn(false);
        } catch {
          if (mountedRef.current) { setCamOn(false); setMicOn(false); }
          console.warn("[Media] No camera/mic permission");
        }
      }
      if (!mountedRef.current) { stream?.getTracks().forEach((t) => t.stop()); return; }
      if (stream) { localStreamRef.current = stream; setLocalStream(stream); }

      // 2. Connect to signaling server
      const token   = getAccessToken() ?? "";
      // NEXT_PUBLIC_API_URL may include a path prefix (e.g. /api/v1).
      // Socket.IO treats any path component as the namespace, so we must
      // pass only the origin (scheme + host + port).
      const rawUrl  = process.env.NEXT_PUBLIC_API_URL ?? "https://breed-api.onrender.com";
      let socketUrl: string;
      try {
        socketUrl = new URL(rawUrl).origin; // strips /api/v1 etc.
      } catch {
        socketUrl = rawUrl;
      }
      const socket  = io(socketUrl, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
      socketRef.current = socket;

      const joinTimeout = setTimeout(() => {
        if (mountedRef.current) { setConnecting(false); setConnectionError("Connection timed out"); }
      }, 15000);

      // ── Socket connection established ─────────────────────────────
      socket.on("connect", () => {
        clearTimeout(joinTimeout);
        console.log(`[Socket] Connected (${socket.id})`);
        if (mountedRef.current) setSocketConnected(true);

        socket.emit("meeting:join", { meetingId }, (raw: any) => {
          if (!mountedRef.current) return;
          const res     = raw?.data ?? raw;  // handle both ack formats
          const peers: Array<{ socketId: string; userId: string }> = res?.participants ?? [];
          console.log(`[Join] ${peers.length} existing participant(s)`, peers);

          setConnecting(false);

          if (peers.length === 0) return;

          // Populate participant tiles BEFORE creating offers
          // so ontrack can always find its tile
          setParticipants(
            peers.map(({ socketId, userId }) => ({
              socketId,
              userId,
              name: userId ? `User ${userId.slice(0, 6)}` : "Participant",
              videoEnabled: true,
              audioEnabled: true,
              connectionState: "connecting" as RTCPeerConnectionState,
              stream: undefined,
            })),
          );

          // Wait one tick for state to flush, then build initiator peers
          setTimeout(() => {
            if (!mountedRef.current) return;
            peers.forEach(({ socketId }) => {
              console.log(`[Peer] Creating initiator peer → ${socketId.slice(0, 8)}`);
              buildPeer(socketId, true);
            });
          }, 0);
        });
      });

      socket.on("connect_error", (err) => {
        clearTimeout(joinTimeout);
        console.error("[Socket] connect_error:", err.message);
        if (mountedRef.current) { setConnecting(false); setConnectionError(err.message); }
      });

      socket.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected:", reason);
        if (mountedRef.current) setSocketConnected(false);
      });

      socket.on("reconnect", () => {
        console.log("[Socket] Reconnected — rejoining meeting");
        if (mountedRef.current) setSocketConnected(true);
        socket.emit("meeting:join", { meetingId }, () => {});
      });

      socket.on("connection:established", ({ userId }: { userId: string }) => {
        if (mountedRef.current) setMyUserId(userId);
      });

      // ── New participant joined ─────────────────────────────────────
      socket.on("meeting:participant-joined", ({ userId, socketId }: { userId: string; socketId: string }) => {
        if (!mountedRef.current) return;
        console.log(`[Joined] ${userId.slice(0, 6)} (${socketId.slice(0, 8)})`);

        upsertParticipant({
          socketId, userId,
          name: userId ? `User ${userId.slice(0, 6)}` : "Participant",
          videoEnabled: true, audioEnabled: true,
          connectionState: "connecting",
          stream: undefined,
        });

        // We are the non-initiator — we wait for their offer
        if (!peerMgrRef.current.has(socketId)) buildPeer(socketId, false);
      });

      // ── Participant left ──────────────────────────────────────────
      socket.on("meeting:participant-left", ({ socketId }: { socketId: string }) => {
        if (!mountedRef.current) return;
        console.log(`[Left] ${socketId.slice(0, 8)}`);
        removeParticipant(socketId);
        peerMgrRef.current.close(socketId);
      });

      // ── Offer received (we are non-initiator) ────────────────────
      socket.on("meeting:offer", async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        if (!mountedRef.current) return;
        console.log(`[Offer ← ${from.slice(0, 8)}]`);

        // Ensure participant tile exists
        setParticipants((prev) => {
          if (prev.some((p) => p.socketId === from)) return prev;
          return [...prev, {
            socketId: from, userId: from, name: "Participant",
            videoEnabled: true, audioEnabled: true,
            connectionState: "connecting", stream: undefined,
          }];
        });

        const peerMgr = peerMgrRef.current;
        let pc = peerMgr.get(from);

        // Recreate if needed
        if (!pc || pc.signalingState === "closed") {
          pc = peerMgr.create(from);
          const ls = localStreamRef.current;
          if (ls) ls.getTracks().forEach((t) => { try { pc!.addTrack(t, ls); } catch {} });

          pc.onicecandidate = ({ candidate }) => {
            if (candidate) socket.emit("meeting:ice-candidate", {
              meetingId, targetSocketId: from, candidate: candidate.toJSON(),
            });
          };
          pc.ontrack = ({ streams, track }) => {
            const rs = streams[0] ?? new MediaStream([track]);
            console.log(`[Track ← ${from.slice(0, 8)}] kind=${track.kind}`);
            setParticipants((prev) =>
              prev.map((p) => p.socketId === from ? { ...p, stream: rs } : p),
            );
          };
          pc.onconnectionstatechange = () =>
            setParticipants((prev) =>
              prev.map((p) => p.socketId === from ? { ...p, connectionState: pc!.connectionState } : p),
            );
          pc.oniceconnectionstatechange = () => {
            if (pc!.iceConnectionState === "failed") pc!.restartIce();
          };
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await peerMgr.flushCandidates(from, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`[Answer → ${from.slice(0, 8)}]`);
          socket.emit("meeting:answer", {
            meetingId, targetSocketId: from, sdp: pc.localDescription,
          });
        } catch (e) { console.error(`[Offer] Processing failed:`, e); }
      });

      // ── Answer received ───────────────────────────────────────────
      socket.on("meeting:answer", async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        if (!mountedRef.current) return;
        console.log(`[Answer ← ${from.slice(0, 8)}]`);
        const pc = peerMgrRef.current.get(from);
        if (!pc) { console.warn(`[Answer] No peer for ${from.slice(0, 8)}`); return; }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await peerMgrRef.current.flushCandidates(from, pc);
        } catch (e) { console.error(`[Answer] Processing failed:`, e); }
      });

      // ── ICE candidate received ─────────────────────────────────────
      socket.on("meeting:ice-candidate", async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        if (!mountedRef.current) return;
        const peerMgr = peerMgrRef.current;
        const pc = peerMgr.get(from);
        if (pc?.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (e) { console.warn(`[ICE ← ${from.slice(0,8)}] Failed:`, e); }
        } else {
          peerMgr.queueCandidate(from, candidate);
        }
      });

      // ── Media state ───────────────────────────────────────────────
      socket.on("meeting:participant-media", ({ socketId, video, audio }: any) => {
        if (!mountedRef.current) return;
        patchParticipant(socketId, { videoEnabled: video, audioEnabled: audio });
      });

      // ── Chat ──────────────────────────────────────────────────────
      socket.on("meeting:chat-message", (msg: ChatMessage) => {
        if (!mountedRef.current) return;
        setMessages((prev) => [...prev, msg]);
        if (!chatOpenRef.current) setUnread((c) => c + 1);
      });
    };

    run();

    return () => {
      mountedRef.current = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      socketRef.current?.emit("meeting:leave", { meetingId });
      socketRef.current?.disconnect();
      peerMgrRef.current.closeAll();
    };
  }, [meetingId, buildPeer]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Controls ────────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !micOn;
    stream.getAudioTracks().forEach((t) => { t.enabled = next; });
    setMicOn(next);
    socketRef.current?.emit("meeting:media-state", { meetingId, video: camOn, audio: next });
  }, [micOn, camOn, meetingId]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !camOn;
    stream.getVideoTracks().forEach((t) => { t.enabled = next; });
    setCamOn(next);
    socketRef.current?.emit("meeting:media-state", { meetingId, video: next, audio: micOn });
  }, [camOn, micOn, meetingId]);

  const toggleScreenShare = useCallback(async () => {
    if (sharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setSharing(false);
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) peerMgrRef.current.replaceVideoTrack(videoTrack);
    } else {
      try {
        const disp = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = disp;
        setSharing(true);
        const screenTrack = disp.getVideoTracks()[0];
        peerMgrRef.current.replaceVideoTrack(screenTrack);
        screenTrack.onended = () => toggleScreenShare();
      } catch { /* user cancelled */ }
    }
  }, [sharing]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    socketRef.current?.emit("meeting:chat", { meetingId, content: content.trim() });
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, senderId: myUserId, senderName: "You", content: content.trim(), timestamp: new Date().toISOString() },
    ]);
  }, [meetingId, myUserId]);

  const leave = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    socketRef.current?.emit("meeting:leave", { meetingId });
    socketRef.current?.disconnect();
    peerMgrRef.current.closeAll();
    // router.back() silently does nothing when there is no history entry
    // (e.g. the user opened the meeting link directly on mobile).
    // Fall back to the home dashboard so the button always works.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/dashboard/home");
    }
  }, [meetingId, router]);

  const setChatOpen = useCallback((open: boolean) => {
    chatOpenRef.current = open;
    if (open) setUnread(0);
  }, []);

  const screenStream = screenStreamRef.current;

  return {
    // State
    participants,
    localStream: sharing ? screenStream : localStream,
    rawLocalStream: localStream,
    connecting,
    connectionError,
    socketConnected,
    micOn,
    camOn,
    sharing,
    messages,
    unread,
    myUserId,
    // Actions
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
    leave,
    setChatOpen,
  };
}
