"use client";

import React from "react";
import {
  X,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  Camera,
  Lock,
  Trash2,
  Eye,
  FileCheck
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";

interface EmergencySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySettingsModal: React.FC<EmergencySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const patient = useKioskStore((state) => state.patient);
  const setFaceEnrolled = useKioskStore((state) => state.setFaceEnrolled);

  if (!isOpen) return null;

  const isEnrolled = Boolean(patient.faceEnrolled);

  const handleToggle = () => {
    setFaceEnrolled(!isEnrolled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Profile → Emergency Settings
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                DPDP Act 2023 Biometric Consent Management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Profile Snapshot */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {patient.name || "Aarav Sharma"}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                ABHA: {patient.masked_abha || patient.abha_id || "XX-XXXX-XXXX-3421"}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Registered Patient
          </span>
        </div>

        {/* Face ID Consent Card with DPDP Revoke Switch */}
        <div className="kiosk-card p-5 space-y-4 border-2 border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-2xl shrink-0 ${isEnrolled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 text-base">
                    Emergency Face ID
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isEnrolled
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 border border-slate-300"
                  }`}>
                    {isEnrolled ? "✓ Enrolled" : "Disabled / Not Enrolled"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Used ONLY if brought in unconscious, enabling attending ER clinicians to identify you and access critical allergies/medications.
                </p>
              </div>
            </div>

            {/* Accessible iOS-style toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isEnrolled}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Enrolled Details / Status Message */}
          {isEnrolled ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Active Reference Biometric: </strong>
                <span>Enrolled for emergency trauma lookup. Toggle off anytime to permanently revoke.</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong>Face ID Disabled: </strong>
                <span>No facial reference stored. Emergency department will rely on physical ID or temporary records.</span>
              </div>
            </div>
          )}
        </div>

        {/* DPDP Act Section 6(4) Statutory Notice */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1 text-xs text-amber-950">
          <div className="font-bold flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>DPDP Act 2023 Consent Revocation Guarantee:</span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            Under Section 6(4) of the Digital Personal Data Protection Act 2023, data principals have the unconditional right to withdraw consent as easily as it was given. Toggling this off immediately deletes the reference match vector from the hospital terminal index.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto kiosk-btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md"
          >
            <span>Close Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
