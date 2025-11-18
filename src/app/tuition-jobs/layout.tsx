import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function TuitionJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}