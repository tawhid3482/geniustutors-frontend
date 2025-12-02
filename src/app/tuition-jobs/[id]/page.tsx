// import { Suspense } from "react";
// import { notFound } from "next/navigation";
// import TuitionJobDetailsClient from "./TuitionJobDetailsClient";
// import { API_BASE_URL } from '@/config/api';


// interface TuitionJobPageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function TuitionJobPage({ params }: TuitionJobPageProps) {
//   const { id } = await params;


//   // Validate the job ID format (basic UUID validation)
//   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//   if (!uuidRegex.test(id)) {
//     notFound();
//   }

//   return (
//     <Suspense fallback={<div>Loading job details...</div>}>
//       <TuitionJobDetailsClient jobId={id} />
//     </Suspense>
//   );
// }



import { Suspense } from "react";
import { notFound } from "next/navigation";
import TuitionJobDetailsClient from "./TuitionJobDetailsClient";

interface TuitionJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function TuitionJobPage({ params }: TuitionJobPageProps) {
  try {
    const { id } = await params;


    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!id || id.trim().length === 0) {
      console.log("Empty or invalid ID");
      notFound();
    }

   
    if (!objectIdRegex.test(id)) {
      console.log("ID is not in standard ObjectId format, but passing to client component:", id);
    }

    return (
      <Suspense fallback={<div>Loading job details...</div>}>
        <TuitionJobDetailsClient jobId={id} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in TuitionJobPage:", error);
    notFound();
  }
}