import React from "react";

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 to 1.0
  showLabel?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence, showLabel = true }) => {
  const percentage = Math.round(confidence * 100);

  let colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let dotColor = "bg-emerald-500";
  let label = "High";

  if (confidence < 0.70) {
    colorClass = "bg-red-50 text-red-700 border-red-200";
    dotColor = "bg-red-500";
    label = "Low";
  } else if (confidence < 0.85) {
    colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    dotColor = "bg-amber-500";
    label = "Review";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      title={`AI Confidence: ${percentage}%`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{percentage}%</span>
      {showLabel && <span className="opacity-75">({label})</span>}
    </span>
  );
};
