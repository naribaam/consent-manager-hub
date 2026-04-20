import type { RiskLevel } from "@/lib/consent-types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LABELS: Record<RiskLevel, string> = {
  low: "Низкий риск",
  medium: "Средний риск",
  high: "Высокий риск",
};

const STYLES: Record<RiskLevel, string> = {
  low: "bg-risk-low-bg text-risk-low",
  medium: "bg-risk-medium-bg text-risk-medium",
  high: "bg-risk-high-bg text-risk-high",
};

const DOT: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

export function RiskBadge({
  level,
  explanation,
  className,
}: {
  level: RiskLevel;
  explanation?: string;
  className?: string;
}) {
  const node = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        STYLES[level],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[level])} />
      {LABELS[level]}
    </span>
  );

  if (!explanation) return node;
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help">
          {node}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left">{explanation}</TooltipContent>
    </Tooltip>
  );
}
