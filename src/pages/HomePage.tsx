import { ArrowRight, History, Hash, Loader2, X, User as UserIcon, Check, Edit2 } from "lucide-react";
import type { MeetingSession } from "@/lib/schema/meeting";
import type { User } from "@/lib/schema/user";
import { useHomePage } from "@/hooks/useHomePage";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HomePageProps {
  user: User | null;
  onSaveUser: (name: string) => User;
  onUpdateUserName: (name: string) => User | null;
  onJoinMeeting: (session: MeetingSession) => void;
}

function formatLastJoinedAt(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "刚刚加入";
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前加入`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前加入`;

  return `${new Date(timestamp).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  })} ${new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} 加入`;
}

export function HomePage({
  user,
  onSaveUser,
  onUpdateUserName,
  onJoinMeeting,
}: HomePageProps) {
  const {
    userName,
    setUserName,
    meetingId,
    setMeetingId,
    loading,
    meetingHistory,
    isEditingName,
    setIsEditingName,
    handleSaveUser,
    handleJoinMeeting,
    handleRemoveMeeting,
  } = useHomePage({ user, onSaveUser, onJoinMeeting });

  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (isEditingName && user) {
      setRenameValue(user.name);
    }
  }, [isEditingName, user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950 overflow-hidden">
      <div className="bg-grain" />

      <div className="relative z-10 w-full max-w-sm">
        {!user ? (
          <div key="onboarding" className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
            <div className="mb-16 text-center pointer-events-none select-none">
              <h1 className="text-5xl font-bold tracking-tighter text-white mb-4 font-mono">
                唠嗑
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-white/10" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
                  随时随地，简单开黑
                </p>
                <div className="h-px w-8 bg-white/10" />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-[22px] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-300" />
              <div className="relative">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userName.trim()) {
                      handleSaveUser();
                    }
                  }}
                  placeholder="给自己起个名字"
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-6 py-5 text-center text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/40 focus:ring-8 focus:ring-blue-500/5 backdrop-blur-md transition-all text-lg font-medium"
                  autoFocus
                  maxLength={15}
                />
              </div>
            </div>

            <div
              className={cn(
                "mt-10 flex justify-center transition-all duration-700 delay-100",
                userName.trim()
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6 pointer-events-none",
              )}
            >
              <button
                onClick={handleSaveUser}
                className="group flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white border border-white/5 hover:border-white/10 transition-all text-xs font-bold uppercase tracking-widest"
              >
                <span>进入大厅</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <div key="main-content" className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-md">
              {isEditingName ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                    修改用户名
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && renameValue.trim()) {
                          onUpdateUserName(renameValue.trim());
                          setIsEditingName(false);
                        } else if (e.key === "Escape") {
                          setIsEditingName(false);
                        }
                      }}
                      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                      autoFocus
                      maxLength={15}
                    />
                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (renameValue.trim()) {
                            onUpdateUserName(renameValue.trim());
                            setIsEditingName(false);
                          }
                        }}
                        disabled={!renameValue.trim()}
                        className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg disabled:opacity-0 transition-all"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between group/profile">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/15 shadow-inner group-hover/profile:border-white/25 transition-colors">
                        <UserIcon className="w-6 h-6 text-zinc-300" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-sm" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        当前在线
                      </p>
                      <div className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        {user.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/profile:opacity-100 focus:opacity-100"
                    title="修改名字"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    加入会议
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                    placeholder="输入或粘贴会议 ID"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    disabled={loading}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-2">
                    <button
                      onClick={() => handleJoinMeeting()}
                      disabled={!meetingId.trim() || loading}
                      className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {meetingHistory.length > 0 && (
                <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      近期会议
                    </label>
                    <div className="h-px flex-1 bg-white/10 mx-4" />
                  </div>
                  <div className="grid gap-3">
                    {meetingHistory.map((historyMeeting) => (
                      <div
                        key={historyMeeting.meetingId}
                        className="group relative bg-zinc-900/50 border border-white/10 rounded-2xl p-4 hover:bg-zinc-900/70 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors border border-white/10 shadow-sm">
                            <History className="w-4 h-4" />
                          </div>
                          <div
                            className="min-w-0 flex-1 cursor-pointer"
                            onClick={() => handleJoinMeeting(historyMeeting.meetingId)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                                {historyMeeting.meetingTitle || historyMeeting.meetingId}
                              </span>
                              {historyMeeting.metadataLoading ? (
                                <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                              ) : historyMeeting.isLive ? (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                    {historyMeeting.liveParticipants} 在线
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                              <span className="font-mono opacity-80">
                                {historyMeeting.meetingId.slice(0, 8)}...
                              </span>
                              <span className="opacity-40">•</span>
                              <span>{formatLastJoinedAt(historyMeeting.lastJoinedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleRemoveMeeting(historyMeeting.meetingId)}
                              className="p-2 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                              title="移除"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleJoinMeeting(historyMeeting.meetingId)}
                              className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
