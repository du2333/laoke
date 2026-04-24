import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type OnboardingProps = {
  userName: string;
  setUserName: (value: string) => void;
  onSaveUser: () => void;
};

export function Onboarding({ userName, setUserName, onSaveUser }: OnboardingProps) {
  return (
    <div
      key="onboarding"
      className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
    >
      <div className="mb-16 text-center pointer-events-none select-none">
        <h1 className="text-5xl font-bold tracking-tighter text-white mb-4 font-mono">唠嗑</h1>
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
            onChange={(event) => setUserName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && userName.trim()) {
                onSaveUser();
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
          onClick={onSaveUser}
          className="group flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white border border-white/5 hover:border-white/10 transition-all text-xs font-bold uppercase tracking-widest"
        >
          <span>进入大厅</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
