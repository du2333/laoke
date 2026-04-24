export function formatLastJoinedAt(timestamp: number) {
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

export function formatCreatedAt(value: string | null) {
  if (!value) return "创建时间未知";

  return new Date(value).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
