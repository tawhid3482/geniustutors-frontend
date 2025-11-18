import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Tutor | Genius Tutor',
  description: 'Join our platform as a tutor and start teaching students. Register now to connect with students looking for qualified tutors.',
  keywords: ['tutor registration', 'become a tutor', 'tutor signup', 'teach online', 'home tuition', 'tutoring jobs'],
  openGraph: {
    title: 'Become a Tutor | Genius Tutor',
    description: 'Join our platform as a tutor and start teaching students. Register now to connect with students looking for qualified tutors.',
    type: 'website',
  },
}

export default function TutorSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

