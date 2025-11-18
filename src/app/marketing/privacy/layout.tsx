import { Metadata } from 'next';
import { metadata as pageMetadata } from './metadata';
import { PageClientLayout } from "@/components/layout/PageClientLayout";

export const metadata: Metadata = pageMetadata;

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}
