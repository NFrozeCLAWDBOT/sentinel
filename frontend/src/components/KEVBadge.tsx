import { formatDate } from "@/lib/utils";

interface KEVBadgeProps {
  dueDate?: string;
}

export function KEVBadge({ dueDate }: KEVBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-primary-bright/20 text-primary-bright border border-primary-bright/40">
      <span className="w-2 h-2 rounded-full bg-primary-bright animate-pulse-gold" />
      KEV
      {dueDate && (
        <span className="opacity-70 text-[10px]">Due {formatDate(dueDate)}</span>
      )}
    </span>
  );
}
