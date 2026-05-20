"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/api";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare,
  Phone, Users, ArrowLeft, Send, X, Pin,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  stream?: MediaStream;
  video: boolean;
  audio: boolean;
  isPinned?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// ── Video Tile ──────────────────────────────────────────────────────────────

function VideoTile({
  stream, name, muted = false, isMe = false, video = true, audio = true,
}: {
  stream?: MediaStream; name: string; muted?: boolean;
  isMe?: boolean; video?: boolean; audio?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream, video]);

  const initials = name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="relative bg-[#1a0835] rounded-2xl overflow-hidden aspect-video flex items-center justify-center group w-full h-full">
      {stream && video ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#870BD6] to-[#5B26B1] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/50">
            {initials}
          </div>
          <p className="text-white/50 text-xs">{video && stream ? "Connecting…" : "Camera off"}</p>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-3 left-3">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
          {!audio && <MicOff size={11} className="text-red-400 shrink-0" />}
          <span className="text-white text-xs font-medium">{isMe ? `${name} (You)` : name}</span>
        </div>
      </div>
    </div>
  );
}

// ── Control Button ──────────────────────────────────────────────────────────

function CtrlBtn({
  onClick, icon: Icon, offIcon: OffIcon, on, danger = false, label, badge,
}: {
  onClick: () => void; icon: React.ElementType; offIcon?: React.ElementType;
  on: boolean; danger?: boolean; label: string; badge?: number;
}) {
  const Ic = !on && OffIcon ? OffIcon : Icon;
  return (
    <button onClick={onClick} title={label} className="flex flex-col items-center gap-1.5 group relative">
      <div className={`w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
        danger
          ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/40"
          : on
          ? "bg-[#870BD6] text-white hover:bg-[#7009C0] shadow-lg shadow-purple-900/30"
          : "bg-[#2D1B55]/80 text-white/60 hover:bg-[#3D2565] hover:text-white border border-white/5"
      }`}>
        <Ic size={18} />
      </div>
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors hidden sm:block">{label}</span>
    </button>
  );
}

// ── Main Room Page ──────────────────────────────────────────────────────────

export default function MeetingRoomPage() {
  const { id: meetingId } = useParams<{ id: string }>();
  const router = useRouter();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myName, setMyName] = useState("Me");
  const [myUserId, setMyUserId] = useState("");
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConns = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  // ICE candidates buffered before remote description is set
  const iceQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // ── Media ──────────────────────────────────────────────────────────────

  const getMedia = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(s); localStreamRef.current = s; return s;
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(s); localStreamRef.current = s; setCamOn(false); return s;
      } catch {
        setCamOn(false); setMicOn(false); return null;
      }
    }
  }, []);

  // ── Flush buffered ICE candidates after remote description is set ───────

  const flushIce = useCallback(async (pc: RTCPeerConnection, peerId: string) => {
    const queue = iceQueue.current.get(peerId) ?? [];
    iceQueue.current.delete(peerId);
    for (const c of queue) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore stale */ }
    }
  }, []);

  // ── Create peer connection ──────────────────────────────────────────────

  const createPeer = useCallback((targetSocketId: string, isInitiator: boolean, stream: MediaStream | null) => {
    // Avoid duplicate peer connections
    const existing = peerConns.current.get(targetSocketId);
    if (existing && existing.signalingState !== "closed") return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("meeting:signal", {
          meetingId, targetSocketId,
          signal: { type: "ice-candidate", candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      setParticipants((prev) =>
        prev.map((p) => p.socketId === targetSocketId ? { ...p, stream: e.streams[0] } : p),
      );
    };

    peerConns.current.set(targetSocketId, pc);

    if (isInitiator) {
      pc.createOffer()
        .then((o) => pc.setLocalDescription(o))
        .then(() => {
          socketRef.current?.emit("meeting:signal", {
            meetingId, targetSocketId,
            signal: { type: "offer", sdp: pc.localDescription },
          });
        })
        .catch(console.warn);
    }

    return pc;
  }, [meetingId]);

  // ── Join room ───────────────────────────────────────────────────────────

  const joinRoom = useCallback(async () => {
    setConnecting(true);
    const stream = await getMedia();
    const token = getAccessToken() ?? "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://breed-api.onrender.com";

    const socket: Socket = io(apiUrl, { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;

    const connectTimeout = setTimeout(() => setConnecting(false), 10000);

    socket.on("connect", () => {
      clearTimeout(connectTimeout);
      socket.emit("meeting:join", { meetingId }, (res: { success: boolean; participants?: string[] }) => {
        setConnecting(false);
        if (res?.participants?.length) {
          res.participants.forEach((pSocketId) => createPeer(pSocketId, true, stream));
        }
      });
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket error:", err.message);
      clearTimeout(connectTimeout);
      setConnecting(false);
    });

    socket.on("meeting:participant-joined", ({ userId, socketId }: { userId: string; socketId: string }) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === socketId)) return prev;
        return [...prev, { socketId, userId, name: `User ${userId.slice(0, 6)}`, video: true, audio: true }];
      });
      // Only create if not already created by an incoming offer
      if (!peerConns.current.has(socketId)) {
        createPeer(socketId, false, stream);
      }
    });

    socket.on("meeting:participant-left", ({ socketId }: { socketId: string }) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      peerConns.current.get(socketId)?.close();
      peerConns.current.delete(socketId);
      iceQueue.current.delete(socketId);
    });

    socket.on("meeting:signal", async ({ from, signal }: { from: string; signal: any }) => {
      let pc = peerConns.current.get(from);

      try {
        if (signal.type === "offer") {
          if (!pc || pc.signalingState === "closed") pc = createPeer(from, false, stream);
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          await flushIce(pc, from);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("meeting:signal", {
            meetingId, targetSocketId: from,
            signal: { type: "answer", sdp: pc.localDescription },
          });
        } else if (signal.type === "answer") {
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            await flushIce(pc, from);
          }
        } else if (signal.type === "ice-candidate") {
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            // Buffer until remote description is ready
            const q = iceQueue.current.get(from) ?? [];
            q.push(signal.candidate);
            iceQueue.current.set(from, q);
          }
        }
      } catch (err) {
        console.warn("Signal handling error:", err);
      }
    });

    socket.on("meeting:participant-media", ({ socketId, video, audio }: any) => {
      setParticipants((prev) => prev.map((p) => p.socketId === socketId ? { ...p, video, audio } : p));
    });

    socket.on("meeting:chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (!showChat) setUnreadCount((c) => c + 1);
    });

    socket.on("connection:established", ({ userId, socketId }: { userId: string; socketId: string }) => {
      setMyUserId(userId);
    });

    socket.on("disconnect", () => {});
  }, [meetingId, getMedia, createPeer, flushIce, showChat]);

  useEffect(() => {
    joinRoom();
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStream?.getTracks().forEach((t) => t.stop());
      socketRef.current?.emit("meeting:leave", { meetingId });
      socketRef.current?.disconnect();
      peerConns.current.forEach((pc) => pc.close());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (showChat) setUnreadCount(0); }, [showChat]);

  // ── Controls ────────────────────────────────────────────────────────────

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    setMicOn((v) => { const next = !v; socketRef.current?.emit("meeting:media-state", { meetingId, video: camOn, audio: next }); return next; });
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
    setCamOn((v) => { const next = !v; socketRef.current?.emit("meeting:media-state", { meetingId, video: next, audio: micOn }); return next; });
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null); setScreenSharing(false);
      const vt = localStream?.getVideoTracks()[0];
      if (vt) peerConns.current.forEach((pc) => pc.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(vt));
    } else {
      try {
        const disp = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(disp); setScreenSharing(true);
        const st = disp.getVideoTracks()[0];
        peerConns.current.forEach((pc) => pc.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(st));
        disp.getVideoTracks()[0].onended = toggleScreenShare;
      } catch { /* user cancelled */ }
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socketRef.current?.emit("meeting:chat", { meetingId, content: chatInput.trim() });
    setMessages((prev) => [...prev, {
      id: `${Date.now()}`, senderId: myUserId, senderName: myName,
      content: chatInput.trim(), timestamp: new Date().toISOString(),
    }]);
    setChatInput("");
  };

  const leaveMeeting = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    socketRef.current?.emit("meeting:leave", { meetingId });
    socketRef.current?.disconnect();
    peerConns.current.forEach((pc) => pc.close());
    router.back();
  };

  // ── Layout helpers ──────────────────────────────────────────────────────

  const me: Participant = {
    socketId: "me", userId: myUserId, name: myName,
    stream: screenSharing ? (screenStream ?? undefined) : (localStream ?? undefined),
    video: camOn, audio: micOn,
  };
  const allParticipants = [me, ...participants];
  const pinned = pinnedId ? allParticipants.find((p) => p.socketId === pinnedId) : null;
  const gridCols = allParticipants.length <= 1 ? "grid-cols-1"
    : allParticipants.length <= 4 ? "grid-cols-2" : "grid-cols-3";

  // ── Connecting screen ────────────────────────────────────────────────────

  if (connecting) {
    return (
      <div className="fixed inset-0 bg-[#0D0427] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#870BD6] to-[#5B26B1] flex items-center justify-center shadow-xl shadow-purple-900/60">
          <Video size={28} className="text-white" />
        </div>
        <p className="text-white font-semibold text-lg">Joining meeting…</p>
        <p className="text-white/40 text-sm">Setting up your camera and microphone</p>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#870BD6] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <button onClick={() => router.back()} className="mt-6 flex items-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors">
          <ArrowLeft size={14} /> Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0D0427] flex flex-col overflow-hidden select-none">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="h-14 px-3 lg:px-5 flex items-center justify-between shrink-0 border-b border-white/5 bg-[#100228]/80 backdrop-blur-sm gap-2">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={leaveMeeting} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#870BD6] to-[#5B26B1] flex items-center justify-center shrink-0">
            <Video size={13} className="text-white" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-white font-semibold text-sm truncate">Meeting Room</p>
            <p className="text-white/40 text-xs">{allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Center — participant count on mobile */}
        <p className="sm:hidden text-white/60 text-xs font-medium shrink-0">
          {allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""}
        </p>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => { setShowParticipants((v) => !v); setShowChat(false); }}
            className={`p-2 rounded-xl transition-all ${showParticipants ? "bg-[#870BD6] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => { setShowChat((v) => !v); setShowParticipants(false); }}
            className={`relative p-2 rounded-xl transition-all ${showChat ? "bg-[#870BD6] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
          >
            <MessageSquare size={16} />
            {unreadCount > 0 && !showChat && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Video area */}
        <div className="flex-1 overflow-hidden p-2 lg:p-3">
          {pinned ? (
            <div className="flex gap-2 h-full">
              <div className="flex-1">
                <VideoTile stream={pinned.stream} name={pinned.name} muted={pinned.socketId === "me"}
                  isMe={pinned.socketId === "me"} video={pinned.video} audio={pinned.audio} />
              </div>
              {allParticipants.filter((p) => p.socketId !== pinnedId).length > 0 && (
                <div className="w-32 lg:w-40 flex flex-col gap-2 overflow-y-auto">
                  {allParticipants.filter((p) => p.socketId !== pinnedId).map((p) => (
                    <div key={p.socketId} onClick={() => setPinnedId(p.socketId)} className="cursor-pointer rounded-xl overflow-hidden aspect-video">
                      <VideoTile stream={p.stream} name={p.name} muted={p.socketId === "me"} isMe={p.socketId === "me"} video={p.video} audio={p.audio} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-2 lg:gap-3 h-full auto-rows-fr`}>
              {allParticipants.map((p) => (
                <div key={p.socketId} className="cursor-pointer"
                  onDoubleClick={() => setPinnedId(p.socketId === pinnedId ? null : p.socketId)}>
                  <VideoTile stream={p.stream} name={p.name} muted={p.socketId === "me"} isMe={p.socketId === "me"} video={p.video} audio={p.audio} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel — fixed overlay on mobile, inline on desktop */}
        {(showChat || showParticipants) && (
          <div className="fixed inset-0 z-30 lg:relative lg:inset-auto lg:z-auto lg:w-72 bg-[#100228] border-l border-white/5 flex flex-col lg:shrink-0">
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 shrink-0">
              <h3 className="text-white font-semibold text-sm">
                {showChat ? "Chat" : `Participants (${allParticipants.length})`}
              </h3>
              <button onClick={() => { setShowChat(false); setShowParticipants(false); }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-10">
                      <MessageSquare size={28} className="text-white/20" />
                      <p className="text-white/30 text-xs">No messages yet</p>
                    </div>
                  ) : messages.map((msg) => {
                    const isMe = msg.senderId === myUserId;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-white/30 text-[10px] mb-1 px-1">
                          {isMe ? "You" : msg.senderName}
                          <span className="ml-1">{new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        </span>
                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed break-words ${
                          isMe ? "bg-[#870BD6] text-white rounded-tr-sm" : "bg-white/10 text-white rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-white/5 shrink-0">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#870BD6]/50 transition-colors">
                    <input type="text" value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendChat())}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30 min-w-0" />
                    <button onClick={sendChat} disabled={!chatInput.trim()}
                      className="w-7 h-7 rounded-full bg-[#870BD6] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#7009C0] transition-colors shrink-0">
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {allParticipants.map((p) => (
                  <div key={p.socketId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#870BD6] to-[#5B26B1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(p.socketId === "me" ? myName : p.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.socketId === "me" ? `${p.name} (You)` : p.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!p.audio && <MicOff size={12} className="text-red-400" />}
                      {!p.video && <VideoOff size={12} className="text-white/30" />}
                    </div>
                    <button onClick={() => setPinnedId(p.socketId === pinnedId ? null : p.socketId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                      <Pin size={12} className={p.socketId === pinnedId ? "text-[#870BD6]" : "text-white/40"} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="h-20 lg:h-24 shrink-0 flex items-center justify-center px-3 border-t border-white/5 bg-[#100228]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto max-w-full px-2">
          <CtrlBtn onClick={toggleMic} icon={Mic} offIcon={MicOff} on={micOn} label={micOn ? "Mute" : "Unmute"} />
          <CtrlBtn onClick={toggleCam} icon={Video} offIcon={VideoOff} on={camOn} label={camOn ? "Stop Video" : "Start Video"} />
          <CtrlBtn onClick={toggleScreenShare} icon={Monitor} offIcon={MonitorOff} on={screenSharing} label={screenSharing ? "Stop Share" : "Share Screen"} />
          <CtrlBtn
            onClick={() => { setShowChat((v) => !v); setShowParticipants(false); }}
            icon={MessageSquare} on={showChat} label="Chat" badge={!showChat ? unreadCount : 0}
          />
          <CtrlBtn
            onClick={() => { setShowParticipants((v) => !v); setShowChat(false); }}
            icon={Users} on={showParticipants} label="People"
          />

          <div className="w-px h-8 bg-white/10 mx-1 shrink-0" />

          <button onClick={leaveMeeting}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-4 lg:px-6 py-2.5 transition-all duration-200 shadow-lg shadow-red-900/40 shrink-0 text-sm">
            <Phone size={15} className="rotate-[135deg]" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}
