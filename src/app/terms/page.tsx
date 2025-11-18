import { Metadata } from "next";
import TermsClient from "@/components/marketing/TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service | Tutor Today",
  description: "Read the terms and conditions for using Tutor Today services.",
};

export default function TermsPage() {
  return <TermsClient />;
}
