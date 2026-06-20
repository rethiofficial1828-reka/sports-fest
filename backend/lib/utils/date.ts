import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function formatDate(date: string | Date): string {
  return dayjs(date).format("DD MMM YYYY");
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format("DD MMM YYYY, h:mm A");
}

export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function isLive(eventDate: string, eventEndDate?: string): boolean {
  const now = dayjs();
  const start = dayjs(eventDate);
  const end = eventEndDate ? dayjs(eventEndDate) : start.add(1, "day");
  return now.isAfter(start) && now.isBefore(end);
}

export function isUpcoming(eventDate: string): boolean {
  return dayjs(eventDate).isAfter(dayjs());
}

export function isClosed(registrationDeadline: string): boolean {
  return dayjs(registrationDeadline).isBefore(dayjs());
}

export function getCountdown(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = dayjs();
  const target = dayjs(targetDate);
  const diff = target.diff(now, "second");

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return { days, hours, minutes, seconds, expired: false };
}

export function formatFee(fee: number): string {
  if (fee === 0) return "Free";
  return `₹${fee.toLocaleString("en-IN")}`;
}

export function formatPrizePool(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}
