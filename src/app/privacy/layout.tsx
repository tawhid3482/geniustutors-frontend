import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}
