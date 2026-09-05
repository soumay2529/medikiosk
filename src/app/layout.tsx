import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "MediKiosk — AI-Assisted Multilingual OPD Clinical Intake",
  description: "Touch and voice clinical history intake, OCR prescription digitisation, AYUSH assessment, and ABDM FHIR R4 export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-md antialiased select-none">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
