import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tuition Job Not Found</h1>
        <p className="text-gray-600 mb-6">
          The tuition job you're looking for doesn't exist or may have been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/tuition-jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
