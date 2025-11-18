import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is used for both tutor dashboard (/tutor) and tutor profiles (/tutor/[id])
  // Tutor profiles should be accessible to all users (students, tutors, guests)
  // Only the tutor dashboard should be restricted to tutors
  return <PageClientLayout showNavbar={false} showFooter={false}>{children}</PageClientLayout>;
}
