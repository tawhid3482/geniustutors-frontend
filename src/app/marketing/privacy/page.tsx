import { Metadata } from "next";
import PrivacyClient from "@/components/marketing/PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Tutor Connect",
  description: "Learn about how we protect your privacy and handle your data at Tutor Connect.",
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}