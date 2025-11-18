import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function TutorRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}