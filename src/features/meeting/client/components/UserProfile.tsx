import { Check, Edit2, Shield, User as UserIcon, X } from "lucide-react";

import type { User } from "@/features/user/client/schema";
import { cn } from "@/lib/utils";

type UserProfileProps = {
  user: User;
  isEditingName: boolean;
  renameValue: string;
  setRenameValue: (value: string) => void;
  setIsEditingName: (value: boolean) => void;
  onUpdateUserName: (name: string) => User | null;
  isAdminPanelVisible?: boolean;
  onToggleAdminPanel?: () => void;
};

export function UserProfile({
  user,
  isEditingName,
  renameValue,
  setRenameValue,
  setIsEditingName,
  onUpdateUserName,
  isAdminPanelVisible,
  onToggleAdminPanel,
}: UserProfileProps) {
  function saveRename() {
    if (!renameValue.trim()) return;
    onUpdateUserName(renameValue.trim());
    setIsEditingName(false);
  }

  return (
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
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  saveRename();
                } else if (event.key === "Escape") {
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
                onClick={saveRename}
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
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">当前在线</p>
              <div className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {user.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/profile:opacity-100 transition-all">
            <button
              onClick={() => setIsEditingName(true)}
              className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all focus:opacity-100 active:scale-95"
              title="修改名字"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {onToggleAdminPanel && (
              <button
                onClick={onToggleAdminPanel}
                className={cn(
                  "p-3 rounded-xl transition-all focus:opacity-100 active:scale-95",
                  isAdminPanelVisible
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10",
                )}
                title="管理员面板"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
