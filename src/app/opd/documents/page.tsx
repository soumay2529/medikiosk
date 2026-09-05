"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Check,
  Edit2,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck,
  AlertCircle,
  Plus,
  Flower2
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { simulateOcrExtraction } from "@/lib/mock-ai";
import { ExtractedDocumentField, DocumentRecord } from "@/types/kiosk";
import { ConfidenceIndicator } from "@/components/common/ConfidenceIndicator";
import { AudioPromptButton } from "@/components/common/AudioPromptButton";

export default function DocumentsPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const documents = useKioskStore((state) => state.documents);
  const addDocument = useKioskStore((state) => state.addDocument);
  const updateExtractedField = useKioskStore((state) => state.updateExtractedField);
  const confirmExtractedFieldToMedications = useKioskStore((state) => state.confirmExtractedFieldToMedications);
  const isLowConfidenceOcr = useKioskStore((state) => state.demoFlags.isLowConfidenceOcr);

  const t = getTranslation(language);

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Process a document (either uploaded or sample)
  const processSampleDocument = (title: string, rawSampleText: string) => {
    setIsProcessing(true);

    setTimeout(() => {
      const extracted = simulateOcrExtraction(isLowConfidenceOcr);
      const newDoc: DocumentRecord = {
        id: `doc-${Date.now()}`,
        type: "prescription",
        title: title || "OPD Prescription Note",
        uploadTimestamp: new Date().toISOString(),
        rawText: rawSampleText,
        extractedFields: extracted,
      };
      addDocument(newDoc);
      setIsProcessing(false);
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processSampleDocument(
        file.name,
        "Rx: Tab Metformin 500mg BD, Tab Telmisartan 40mg OD, Tab Atorvastatin 20mg HS. Follow up after 3 weeks."
      );
    }
  };

  const handleStartEdit = (docId: string, idx: number, currentValue: string) => {
    setEditingDocId(docId);
    setEditingFieldIndex(idx);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (docId: string, idx: number) => {
    updateExtractedField(docId, idx, {
      value: editValue,
      verificationState: "patient_confirmed",
    });
    setEditingFieldIndex(null);
    setEditingDocId(null);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t.documentTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.documentSubtitle}
            </p>
          </div>
          <AudioPromptButton
            textToSpeak={`${t.documentTitle}. ${t.documentSubtitle}`}
            size="md"
          />
        </div>

        {/* Upload & Scanner Zone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Drag & Drop Upload Zone */}
          <div className="md:col-span-2 relative border-3 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 bg-white text-center transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[220px]">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">{t.dragDropText}</h3>
            <p className="text-sm text-slate-500 mt-1">Accepts JPG, PNG, PDF prescriptions & reports</p>
          </div>

          {/* Quick Demo Pre-loader */}
          <div className="md:col-span-1 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Instant Hackathon Demo</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">Sample Prescription</h4>
              <p className="text-xs text-slate-600 mt-1">
                Load a pre-scanned AIIMS prescription card to test OCR entity extraction instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                processSampleDocument(
                  "AIIMS Prescription - Dr. Sharma",
                  "Rx: Tab Metformin Hydrochloride 500mg BD pc, Tab Telmisartan 40mg OD am. BP: 138/88. Date: 12/08/2026."
                )
              }
              disabled={isProcessing}
              className="mt-4 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              Load Sample Document
            </button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200 flex items-center justify-center gap-4 text-blue-900 font-bold animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>{t.ocrProcessing}</span>
          </div>
        )}

        {/* Low-Confidence Simulation Banner */}
        {isLowConfidenceOcr && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center gap-3 text-amber-950 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Simulated Low-Confidence Mode Active (&lt;0.85):</strong> Entities extracted below have low character recognition confidence and require explicit confirmation before entering the consultation record.
            </span>
          </div>
        )}

        {/* Extraction Results Table */}
        {documents.length > 0 && (
          <div className="space-y-4 pt-2">
            {documents.map((doc) => (
              <div key={doc.id} className="kiosk-card p-6 space-y-4 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{doc.title}</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Uploaded: {new Date(doc.uploadTimestamp).toLocaleTimeString("en-IN")} • {doc.extractedFields.length} entities recognized
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    OCR Complete
                  </span>
                </div>

                {/* Raw snippet */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono italic">
                  &quot;{doc.rawText}&quot;
                </div>

                {/* Extraction Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                        <th className="py-3 px-4">{t.colField}</th>
                        <th className="py-3 px-4">{t.colValue}</th>
                        <th className="py-3 px-4">{t.colConfidence}</th>
                        <th className="py-3 px-4 text-right">{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {doc.extractedFields.map((field, idx) => {
                        const isEditingThis = editingDocId === doc.id && editingFieldIndex === idx;

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50 transition-colors ${
                              field.confidence < 0.70 ? "bg-red-50/30" : ""
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {field.field}
                            </td>

                            <td className="py-3.5 px-4 text-slate-900">
                              {isEditingThis ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="p-1.5 rounded-lg border-2 border-blue-500 focus:outline-none text-sm font-semibold"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(doc.id, idx)}
                                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                    title="Save edit"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFieldIndex(null)}
                                    className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-semibold">{field.value}</span>
                                  {field.verificationState === "physician_confirmed" && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                      Confirmed
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <ConfidenceIndicator confidence={field.confidence} />
                            </td>

                            <td className="py-3.5 px-4 text-right space-x-2">
                              {field.verificationState !== "physician_confirmed" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => confirmExtractedFieldToMedications(doc.id, idx)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(doc.id, idx, field.value)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                                  >
                                    Edit
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-emerald-700 font-bold flex items-center justify-end gap-1">
                                  <Check className="w-4 h-4" /> Added to Record
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={() => router.push("/opd/history")}
          className="w-full sm:w-auto kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Proceed to AYUSH button */}
          <button
            type="button"
            onClick={() => router.push("/opd/ayush")}
            className="w-full sm:w-auto kiosk-btn border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-base"
          >
            <Flower2 className="w-5 h-5 text-emerald-700" />
            <span>{t.proceedToAyush}</span>
          </button>

          {/* Skip to Review */}
          <button
            type="button"
            onClick={() => router.push("/opd/review")}
            className="w-full sm:w-auto kiosk-btn bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg"
          >
            <span>{t.skipToReview}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
