import { Metadata } from "next";
import PrivacyClient from "@/components/marketing/PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Tutor Today",
  description: "Learn about how we protect your privacy and handle your data at Tutor Today.",
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
