"use client";

import React from "react";
import { HelpCircle, BellRing, Check, ShieldCheck } from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";

export const StaffAssistModal: React.FC = () => {
  const isStaffAssistActive = useKioskStore((state) => state.isStaffAssistActive);
  const dismissStaffAssist = useKioskStore((state) => state.dismissStaffAssist);

  if (!isStaffAssistActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border-3 border-amber-400 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full mx-auto flex items-center justify-center animate-pulse">
          <BellRing className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold uppercase rounded-full tracking-wider">
            Flow Paused • Attendant Alerted
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Kiosk Assistant Has Been Called
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Please wait at <strong>Terminal 04</strong>. An OPD patient navigator is arriving to assist you with voice entry or question clarification.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono text-left space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Trail Logged:</span>
          </div>
          <div>Event: <strong>STAFF_ASSIST_REQUESTED</strong></div>
          <div>Terminal: AIIMS OPD Terminal 04</div>
          <div>Timestamp: {new Date().toLocaleTimeString("en-IN")}</div>
        </div>

        <button
          type="button"
          onClick={dismissStaffAssist}
          className="w-full kiosk-btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg"
        >
          <Check className="w-5 h-5 text-emerald-400" />
          <span>I am ready to resume intake</span>
        </button>
      </div>
    </div>
  );
};
