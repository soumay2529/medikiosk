"use client";

import React from "react";
import { ShieldCheck, Info, HelpCircle } from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";

export const KioskFooter: React.FC = () => {
  const language = useKioskStore((state) => state.encounter.language);
  const t = getTranslation(language);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-700">
            {t.hospitalDisclaimer}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-400">
            <Info className="w-3.5 h-3.5" />
            ABDM M3 Compliant (FHIR R4)
          </span>
          <span className="hidden md:inline text-slate-300">•</span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            Assistance Bell: Press yellow button on kiosk post
          </span>
        </div>
      </div>
    </footer>
  );
};
