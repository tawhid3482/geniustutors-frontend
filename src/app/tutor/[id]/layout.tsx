import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function TutorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tutor profile pages should be accessible to all users and show navbar/footer
  return <PageClientLayout>{children}</PageClientLayout>;
}
