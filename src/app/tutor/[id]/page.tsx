import TutorProfileClient from './TutorProfileClient';

interface TutorProfilePageProps {
  params: {
    id: string;
  };
}

export default function TutorProfilePage({ params }: TutorProfilePageProps) {
  return <TutorProfileClient tutorId={params.id} />;
}
