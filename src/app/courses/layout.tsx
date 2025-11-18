import { PageClientLayout } from "@/components/layout/PageClientLayout";

// Metadata is exported from metadata.ts file

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}