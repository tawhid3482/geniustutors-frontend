import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}