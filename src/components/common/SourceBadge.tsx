import React from "react";
import { ProvenanceSource } from "@/types/kiosk";
import { Mic, MousePointerClick, FileText, Cpu } from "lucide-react";

interface SourceBadgeProps {
  source: ProvenanceSource;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className = "" }) => {
  const configs: Record<ProvenanceSource, { label: string; icon: any; bg: string; text: string; border: string }> = {
    patient_voice: {
      label: "Patient said",
      icon: Mic,
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    patient_touch: {
      label: "Patient selected",
      icon: MousePointerClick,
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    document: {
      label: "From document",
      icon: FileText,
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    inferred: {
      label: "Inferred (AI)",
      icon: Cpu,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
  };

  const c = configs[source] || configs.inferred;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
      title={`Information provenance: ${c.label}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
};
