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

    console.log("Job ID from params:", id);

    // ✅ MongoDB ObjectId validation (24 characters hexadecimal)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    // ✅ অথবা basic ID validation (শুধু check করুন id আছে কিনা)
    if (!id || id.trim().length === 0) {
      console.log("Empty or invalid ID");
      notFound();
    }

    // যদি ObjectId format এ না হয়, তবুও pass করতে দিন 
    // কারণ API নিজে validation handle করবে
    if (!objectIdRegex.test(id)) {
      console.log("ID is not in standard ObjectId format, but passing to client component:", id);
      // notFound() call করবেন না, client component এ handle করতে দিন
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