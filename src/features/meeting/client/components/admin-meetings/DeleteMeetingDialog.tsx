type DeleteMeetingDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteMeetingDialog({ onCancel, onConfirm }: DeleteMeetingDialogProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl"
        onClick={onCancel}
      />
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-[320px] w-full mx-4 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-2">删除会议</h3>
        <p className="text-sm text-zinc-400 mb-6">
          确定要删除此会议吗？删除后将不再出现在管理列表中。
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors text-sm font-medium active:scale-95"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm font-medium flex items-center gap-2 active:scale-95"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
