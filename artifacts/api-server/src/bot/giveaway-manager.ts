export type Giveaway = {
  messageId: string;
  channelId: string;
  guildId: string;
  prize: string;
  winnersCount: number;
  hostId: string;
  endsAt: Date;
  participants: Set<string>;
  ended: boolean;
};

export const giveaways = new Map<string, Giveaway>();

export function formatTimeLeft(endsAt: Date): string {
  const ms = endsAt.getTime() - Date.now();
  if (ms <= 0) return "انتهى";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} يوم`;
  if (hours > 0) return `${hours} ساعة`;
  if (minutes > 0) return `${minutes} دقيقة`;
  return `${seconds} ثانية`;
}
