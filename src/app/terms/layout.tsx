import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}
