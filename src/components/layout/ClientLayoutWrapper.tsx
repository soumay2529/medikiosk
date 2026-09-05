"use client";

import React, { useEffect } from "react";
import { useKioskStore } from "@/store/useKioskStore";
import { KioskHeader } from "./KioskHeader";
import { KioskFooter } from "./KioskFooter";
import { DemoPanel } from "./DemoPanel";
import { RedFlagModal } from "../common/RedFlagModal";
import { StaffAssistModal } from "../common/StaffAssistModal";
import { OnboardingTutorialModal } from "../common/OnboardingTutorialModal";
import { EmergencySettingsModal } from "../common/EmergencySettingsModal";

export const ClientLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fontSize = useKioskStore((state) => state.accessibility.fontSize);
  const highContrast = useKioskStore((state) => state.accessibility.highContrast);
  const forceRedFlagModal = useKioskStore((state) => state.demoFlags.forceRedFlagModal);
  const setDemoFlag = useKioskStore((state) => state.setDemoFlag);

  const isProfileSettingsOpen = useKioskStore((state) => state.isProfileSettingsOpen);
  const setProfileSettingsOpen = useKioskStore((state) => state.setProfileSettingsOpen);
  const setTutorialOpen = useKioskStore((state) => state.setTutorialOpen);

  useEffect(() => {
    // Check first-visit tutorial flag
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("medikiosk_tutorial_completed");
      if (!hasSeen) {
        setTutorialOpen(true);
      }
    }
  }, [setTutorialOpen]);

  useEffect(() => {
    // Dynamically apply font-size and contrast classes to document body
    document.body.classList.remove("font-sm", "font-md", "font-lg", "font-xl", "high-contrast");
    document.body.classList.add(`font-${fontSize}`);
    if (highContrast) {
      document.body.classList.add("high-contrast");
    }
  }, [fontSize, highContrast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      <KioskHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <KioskFooter />
      <DemoPanel />
      <RedFlagModal
        isOpen={forceRedFlagModal}
        onClose={() => setDemoFlag("forceRedFlagModal", false)}
        reason="Forced red-flag demonstration trigger from tester panel."
      />
      <StaffAssistModal />
      <OnboardingTutorialModal />
      <EmergencySettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setProfileSettingsOpen(false)}
      />
    </div>
  );
};
