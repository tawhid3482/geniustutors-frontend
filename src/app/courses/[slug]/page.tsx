import CourseDetails from '@/components/course/CourseDetails';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ')} - Course Details`,
    description: 'Course details page',
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  return <CourseDetails courseSlug={slug} />;
}