"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Phone, Users, ArrowLeft, Send, X, Pin,
  Wifi, WifiOff, Loader2,
} from "lucide-react";
import { useMeeting, type Participant } from "./hooks/useMeeting";

// ── Video Tile ──────────────────────────────────────────────────────────────

function VideoTile({
  stream, name, muted = false, isMe = false,
  videoEnabled = true, audioEnabled = true,
  connectionState,
}: {
  stream?: MediaStream; name: string; muted?: boolean;
  isMe?: boolean; videoEnabled?: boolean; audioEnabled?: boolean;
  connectionState?: RTCPeerConnectionState;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream whenever it or videoEnabled changes
  const handleVideo = (el: HTMLVideoElement | null) => {
    (videoRef as any).current = el;
    if (el) el.srcObject = stream ?? null;
  };

  const initials = name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
  const isConnecting = connectionState === "connecting" || connectionState === "new";
  const isFailed = connectionState === "failed" || connectionState === "disconnected";

  return (
    <div className="relative bg-[#1a0835] rounded-2xl overflow-hidden w-full h-full flex items-center justify-center group">
      {stream && videoEnabled ? (
        <video
          ref={handleVideo}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#870BD6] to-[#5B26B1] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/50">
            {initials}
          </div>
          <p className="text-white/40 text-xs">
            {isConnecting && !isMe ? "Connecting…" : videoEnabled ? "No video" : "Camera off"}
          </p>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5 max-w-[180px]">
          {!audioEnabled && <MicOff size={11} className="text-red-400 shrink-0" />}
          <span className="text-white text-xs font-medium truncate">{isMe ? `${name} (You)` : name}</span>
        </div>
      </div>

      {/* Connection state badge */}
      {!isMe && (
        <div className="absolute top-3 right-3">
          {isConnecting && (
            <div className="bg-black/60 rounded-full p-1.5">
              <Loader2 size={12} className="text-white/50 animate-spin" />
            </div>
          )}
          {isFailed && (
            <div className="bg-red-500/80 rounded-full p-1.5" title="Connection lost">
              <WifiOff size={12} className="text-white" />
            </div>
          )}
          {connectionState === "connected" && stream && (
            <div className="bg-green-500/20 rounded-full p-1.5">
              <Wifi size={12} className="text-green-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Control Button ──────────────────────────────────────────────────────────

function CtrlBtn({
  onClick, icon: Icon, offIcon: OffIcon, on, danger = false, label, badge = 0,
}: {
  onClick: () => void; icon: React.ElementType; offIcon?: React.ElementType;
  on: boolean; danger?: boolean; label: string; badge?: number;
}) {
  const Ic = !on && OffIcon ? OffIcon : Icon;
  return (
    <button onClick={onClick} title={label} className="relative flex flex-col items-center gap-1 group shrink-0">
      <div className={`w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all ${
        danger
          ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/40"
          : on
          ? "bg-[#870BD6] text-white hover:bg-[#7009C0] shadow-lg shadow-purple-900/30"
          : "bg-[#2D1B55]/80 text-white/60 hover:bg-[#3D2565] hover:text-white border border-white/5"
      }`}>
        <Ic size={18} />
      </div>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <span className="text-[10px] text-white/40 group-hover:text-white/60 hidden sm:block">{label}</span>
    </button>
  );
}

// ── Room Page ───────────────────────────────────────────────────────────────

export default function RoomPage() {
  const { id: meetingId } = useParams<{ id: string }>();

  const {
    participants, localStream, rawLocalStream,
    connecting, connectionError, socketConnected,
    micOn, camOn, sharing,
    messages, unread, myUserId,
    toggleMic, toggleCamera, toggleScreenShare,
    sendMessage, leave, setChatOpen,
  } = useMeeting(meetingId);

  const [showChat, setShowChat]               = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [pinnedId, setPinnedId]               = useState<string | null>(null);
  const [chatInput, setChatInput]             = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const openChat = (open: boolean) => {
    setShowChat(open);
    setChatOpen(open);
  };

  const allParticipants: Participant[] = [
    {
      socketId: "me",
      userId: myUserId,
      name: "Me",
      stream: localStream ?? undefined,
      videoEnabled: camOn,
      audioEnabled: micOn,
      connectionState: "connected",
    },
    ...participants,
  ];

  const pinned   = pinnedId ? allParticipants.find((p) => p.socketId === pinnedId) : null;
  const gridCols = allParticipants.length <= 1 ? "grid-cols-1"
    : allParticipants.length <= 4 ? "grid-cols-2" : "grid-cols-3";

  // ── Connecting / error screen ─────────────────────────────────────────

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
        <button onClick={leave} className="mt-4 text-white/40 text-sm hover:text-white/70 flex items-center gap-2 transition-colors">
          <ArrowLeft size={14} /> Cancel
        </button>
      </div>
    );
  }

  if (connectionError && !socketConnected) {
    return (
      <div className="fixed inset-0 bg-[#0D0427] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <WifiOff size={40} className="text-red-400" />
        <p className="text-white font-semibold text-lg">Connection failed</p>
        <p className="text-white/50 text-sm max-w-xs">{connectionError}</p>
        <button onClick={leave} className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0D0427] flex flex-col overflow-hidden select-none">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="h-14 px-3 lg:px-5 flex items-center justify-between shrink-0 border-b border-white/5 bg-[#100228]/80 backdrop-blur-sm gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={leave} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#870BD6] to-[#5B26B1] flex items-center justify-center shrink-0">
            <Video size={13} className="text-white" />
          </div>
          <p className="text-white font-semibold text-sm truncate hidden sm:block">Meeting Room</p>
        </div>

        {/* Participant count (center on mobile) */}
        <p className="text-white/50 text-xs font-medium shrink-0">
          {allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-1 shrink-0">
          {/* Socket status */}
          <div className={`w-2 h-2 rounded-full mr-1 ${socketConnected ? "bg-green-400" : "bg-red-400"}`} title={socketConnected ? "Connected" : "Disconnected"} />
          <button
            onClick={() => { setShowParticipants((v) => !v); openChat(false); }}
            className={`p-2 rounded-xl transition-all ${showParticipants ? "bg-[#870BD6] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => { openChat(!showChat); setShowParticipants(false); }}
            className={`relative p-2 rounded-xl transition-all ${showChat ? "bg-[#870BD6] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
          >
            <MessageSquare size={16} />
            {unread > 0 && !showChat && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Video grid */}
        <div className="flex-1 overflow-hidden p-2 lg:p-3">
          {pinned ? (
            <div className="flex gap-2 h-full">
              <div className="flex-1">
                <VideoTile
                  stream={pinned.stream} name={pinned.name}
                  muted={pinned.socketId === "me"} isMe={pinned.socketId === "me"}
                  videoEnabled={pinned.videoEnabled} audioEnabled={pinned.audioEnabled}
                  connectionState={pinned.connectionState}
                />
              </div>
              <div className="w-28 lg:w-36 flex flex-col gap-2 overflow-y-auto">
                {allParticipants.filter((p) => p.socketId !== pinnedId).map((p) => (
                  <div key={p.socketId} onClick={() => setPinnedId(p.socketId)} className="cursor-pointer rounded-xl overflow-hidden aspect-video">
                    <VideoTile stream={p.stream} name={p.name} muted={p.socketId === "me"} isMe={p.socketId === "me"}
                      videoEnabled={p.videoEnabled} audioEnabled={p.audioEnabled} connectionState={p.connectionState} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-2 lg:gap-3 h-full auto-rows-fr`}>
              {allParticipants.map((p) => (
                <div key={p.socketId} className="cursor-pointer"
                  onDoubleClick={() => setPinnedId(p.socketId === pinnedId ? null : p.socketId)}>
                  <VideoTile
                    stream={p.stream} name={p.name}
                    muted={p.socketId === "me"} isMe={p.socketId === "me"}
                    videoEnabled={p.videoEnabled} audioEnabled={p.audioEnabled}
                    connectionState={p.connectionState}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel — full-screen overlay on mobile, inline on desktop */}
        {(showChat || showParticipants) && (
          <div className="fixed inset-0 z-30 lg:relative lg:inset-auto lg:z-auto lg:w-72 bg-[#100228] border-l border-white/5 flex flex-col lg:shrink-0">
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 shrink-0">
              <h3 className="text-white font-semibold text-sm">
                {showChat ? "Chat" : `Participants (${allParticipants.length})`}
              </h3>
              <button onClick={() => { setShowParticipants(false); openChat(false); }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Chat */}
            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-10 text-center">
                      <MessageSquare size={28} className="text-white/20" />
                      <p className="text-white/30 text-xs">No messages yet</p>
                    </div>
                  ) : messages.map((msg) => {
                    const isMe = msg.senderId === myUserId || msg.senderId === "local";
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
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#870BD6]/50">
                    <input type="text" value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(chatInput);
                          setChatInput("");
                        }
                      }}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30 min-w-0"
                    />
                    <button
                      onClick={() => { sendMessage(chatInput); setChatInput(""); }}
                      disabled={!chatInput.trim()}
                      className="w-7 h-7 rounded-full bg-[#870BD6] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#7009C0] transition-colors shrink-0"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Participants */}
            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {allParticipants.map((p) => (
                  <div key={p.socketId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#870BD6] to-[#5B26B1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.socketId === "me" ? `${p.name} (You)` : p.name}</p>
                      {p.connectionState && p.connectionState !== "connected" && p.socketId !== "me" && (
                        <p className="text-white/30 text-[10px]">{p.connectionState}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!p.audioEnabled && <MicOff size={12} className="text-red-400" />}
                      {!p.videoEnabled && <VideoOff size={12} className="text-white/30" />}
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
      <div className="h-20 lg:h-24 shrink-0 flex items-center justify-center px-4 border-t border-white/5 bg-[#100228]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto max-w-full">
          <CtrlBtn onClick={toggleMic}          icon={Mic}         offIcon={MicOff}    on={micOn}    label={micOn ? "Mute" : "Unmute"} />
          <CtrlBtn onClick={toggleCamera}       icon={Video}       offIcon={VideoOff}  on={camOn}    label={camOn ? "Stop Video" : "Start Video"} />
          <CtrlBtn onClick={toggleScreenShare}  icon={Monitor}     offIcon={MonitorOff} on={sharing} label={sharing ? "Stop Share" : "Share Screen"} />
          <CtrlBtn onClick={() => { openChat(!showChat); setShowParticipants(false); }}
            icon={MessageSquare} on={showChat} label="Chat" badge={!showChat ? unread : 0} />
          <CtrlBtn onClick={() => { setShowParticipants((v) => !v); openChat(false); }}
            icon={Users} on={showParticipants} label="People" />

          <div className="w-px h-8 bg-white/10 mx-1 shrink-0" />

          <button onClick={leave}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-4 lg:px-6 py-2.5 transition-all shadow-lg shadow-red-900/40 shrink-0 text-sm">
            <Phone size={15} className="rotate-[135deg]" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}
