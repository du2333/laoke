import { ArrowRight, KeyRound, Loader2 } from "lucide-react";

type AdminLoginFormProps = {
  adminPasswordInput: string;
  setAdminPasswordInput: (value: string) => void;
  verifyingAdminPassword: boolean;
  onSaveAdminPassword: () => void;
};

export function AdminLoginForm({
  adminPasswordInput,
  setAdminPasswordInput,
  verifyingAdminPassword,
  onSaveAdminPassword,
}: AdminLoginFormProps) {
  const hasAdminPassword = Boolean(adminPasswordInput.trim());

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
          <KeyRound className="w-4 h-4" />
        </div>
        <input
          type="password"
          value={adminPasswordInput}
          onChange={(event) => setAdminPasswordInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onSaveAdminPassword()}
          placeholder="输入管理密码"
          className="w-full bg-zinc-950/40 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
          disabled={verifyingAdminPassword}
          autoFocus
        />
        <div className="absolute top-1/2 -translate-y-1/2 right-2">
          <button
            onClick={onSaveAdminPassword}
            disabled={!hasAdminPassword || verifyingAdminPassword}
            className={`flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all duration-300 active:scale-95 ${
              hasAdminPassword ? "" : "opacity-0 pointer-events-none"
            } ${verifyingAdminPassword ? "opacity-70 pointer-events-none" : ""}`}
          >
            {verifyingAdminPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
