'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Users, BookOpen, CreditCard, Shield } from 'lucide-react';

const faqCategories = [
  { id: 'general', name: 'General', icon: HelpCircle },
  { id: 'students', name: 'For Students', icon: Users },
  { id: 'tutors', name: 'For Tutors', icon: BookOpen },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield },
];

const faqs = [
  {
    id: 'general-1',
    category: 'general',
    question: 'What is Tutor Today?',
    answer: 'Tutor Today is an online platform that connects students with qualified tutors for home and online tuitions. We help students find the right tutor based on their needs and help tutors find suitable tuition jobs.'
  },
  {
    id: 'general-2',
    category: 'general',
    question: 'How do I sign up?',
    answer: 'You can sign up by clicking the "Register" button on our homepage. You can register as either a student/parent or as a tutor. After registration, you\'ll need to verify your email address to complete the process.'
  },
  {
    id: 'general-3',
    category: 'general',
    question: 'Is there any registration fee?',
    answer: 'No, registration on Tutor Today is completely free for both students and tutors.'
  },
  {
    id: 'students-1',
    category: 'students',
    question: 'How do I find a tutor?',
    answer: 'After registering as a student, you can search for tutors using our search filters. You can filter by subject, location, experience, and other criteria. You can also post a tuition job request and let tutors apply.'
  },
  {
    id: 'students-2',
    category: 'students',
    question: 'How do I contact a tutor?',
    answer: 'Once you find a suitable tutor, you can send them a message directly through our platform. You can also book a demo class if the tutor offers this option.'
  },
  {
    id: 'students-3',
    category: 'students',
    question: 'What if I\'m not satisfied with a tutor?',
    answer: 'We have a rating and review system where you can provide feedback about your tutor. If you\'re not satisfied, you can contact our support team for assistance in finding a replacement.'
  },
  {
    id: 'tutors-1',
    category: 'tutors',
    question: 'How do I register as a tutor?',
    answer: 'Click on the "Register" button and select "Tutor" as your role. You\'ll need to provide your educational qualifications, experience, and other relevant information. After verification, you can start applying for tuition jobs.'
  },
  {
    id: 'tutors-2',
    category: 'tutors',
    question: 'How do I find tuition jobs?',
    answer: 'After registering as a tutor, you can browse available tuition jobs posted by students. You can also set up job alerts based on your preferences and apply directly through the platform.'
  },
  {
    id: 'tutors-3',
    category: 'tutors',
    question: 'How much commission does Tutor Today take?',
    answer: 'We take a small commission from each tuition job. The exact percentage varies based on the job type and other factors. Details are provided before you accept any job.'
  },
  {
    id: 'payment-1',
    category: 'payment',
    question: 'How do payments work?',
    answer: 'Payments are processed securely through our platform. Students pay in advance, and tutors receive payment after completing the tuition sessions. We support multiple payment methods including credit cards, debit cards, and mobile banking.'
  },
  {
    id: 'payment-2',
    category: 'payment',
    question: 'How do tutors get paid?',
    answer: 'Tutors can withdraw their earnings to their bank account or mobile wallet. Payments are typically processed within 3-5 business days after a session is completed and confirmed.'
  },
  {
    id: 'privacy-1',
    category: 'privacy',
    question: 'Is my personal information safe?',
    answer: 'Yes, we take privacy very seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent, except as required by law.'
  },
  {
    id: 'privacy-2',
    category: 'privacy',
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account at any time from your account settings. Please note that this will permanently remove all your data from our system.'
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-x-hidden w-full">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help Center
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our platform, services, and policies.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card className="max-w-3xl mx-auto mt-12 sm:mt-16">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can{`'`}t find the answer you{`'`}re looking for? Please contact our support team.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
