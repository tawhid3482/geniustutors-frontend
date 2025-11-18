import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function PremiumTutorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}