import { DM_Sans, Playfair_Display } from "next/font/google";
import { type ReactNode } from "react";
import { SurgeryFooter } from "./components/SurgeryFooter";
import { SurgeryNav } from "./components/SurgeryNav";

const display = Playfair_Display({ subsets: ["latin"], variable: "--surgery-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--surgery-body" });

export default function SurgeryGuidanceLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} bg-[#faf7f2] text-[#1a2a3a]`}>
      <SurgeryNav />
      {children}
      <SurgeryFooter />
    </div>
  );
}
