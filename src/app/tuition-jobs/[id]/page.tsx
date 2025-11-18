import { Suspense } from "react";
import { notFound } from "next/navigation";
import TuitionJobDetailsClient from "./TuitionJobDetailsClient";
import { API_BASE_URL } from '@/config/api';


interface TuitionJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function TuitionJobPage({ params }: TuitionJobPageProps) {
  const { id } = await params;

  // Validate the job ID format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading job details...</div>}>
      <TuitionJobDetailsClient jobId={id} />
    </Suspense>
  );
}
