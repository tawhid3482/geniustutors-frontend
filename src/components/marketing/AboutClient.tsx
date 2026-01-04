'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Target, 
  Users, 
  Award, 
  Heart,
  Shield,
  Star,
  TrendingUp,
  BookOpen,
  Globe,
  Lightbulb,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const AboutClient = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = [
    { label: "Students Served", value: "25,000+", icon: Users, color: "text-blue-600" },
    { label: "Verified Tutors", value: "5,000+", icon: Award, color: "text-green-600" },
    { label: "Success Rate", value: "95%", icon: TrendingUp, color: "text-yellow-600" },
    { label: "Cities Covered", value: "20+", icon: Globe, color: "text-purple-600" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Every tutor is thoroughly verified with background checks and qualification validation to ensure the highest standards of safety and quality."
    },
    {
      icon: Heart,
      title: "Student-Centric",
      description: "We put students' needs first, focusing on personalized learning experiences that adapt to individual learning styles and goals."
    },
    {
      icon: Star,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our service, from tutor selection to platform usability and customer support."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously innovate our platform and teaching methodologies to provide the most effective and engaging learning experience."
    }
  ];

  const team = [
    {
      name: "Arif Rahman",
      role: "Founder & CEO",
      bio: "Former education consultant with 15+ years of experience in EdTech and a passion for making quality education accessible to all."
    },
    {
      name: "Nusrat Jahan",
      role: "Chief Academic Officer",
      bio: "PhD in Education with extensive experience in curriculum development and educational psychology."
    },
    {
      name: "Kamal Hossain",
      role: "Head of Tutor Relations",
      bio: "Former university professor with a network of top educators across Bangladesh, ensuring we recruit only the best tutors."
    },
    {
      name: "Fariha Ahmed",
      role: "Customer Success Manager",
      bio: "Dedicated to ensuring both students and tutors have a seamless experience on our platform, with a background in customer experience design."
    }
  ];

  // Don't render until mounted to prevent hydration errors
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden w-full" suppressHydrationWarning>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Our Mission to Transform Education in Bangladesh
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Connecting students with exceptional tutors to unlock their full potential through personalized learning experiences.
              </p>
            </div>
            <div className="space-x-4">
              {!user ? (
                <LoginDialog>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </LoginDialog>
              ) : (
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Find a Tutor
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat:any, index:any) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">
                Our Story
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                From a Small Idea to Bangladesh's Leading Tutoring Platform
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                Tutor Connect began in 2018 with a simple mission: to make quality education accessible to every student in Bangladesh, regardless of their location or economic background.
              </p>
              <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                What started as a small network of tutors in Dhaka has grown into the country's most trusted tutoring platform, connecting thousands of students with qualified tutors across multiple subjects and educational levels.
              </p>
              <Button variant="outline" className="mt-4">
                Learn More About Our Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                    <p className="text-muted-foreground">
                      To create an educational ecosystem where every student in Bangladesh has access to quality personalized tutoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                Our Values
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                The Principles That Guide Us
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg/relaxed">
                These core values shape everything we do, from how we build our platform to how we interact with our community.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
            {values.map((value:any, index:any) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                Our Team
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Meet the People Behind Tutor Connect
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg/relaxed">
                Our diverse team of educators, technologists, and education enthusiasts is united by a passion for transforming education.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member:any, index:any) => {
              const initials = member.name
                .split(' ')
                .map((n:any) => n[0])
                .join('')
                .toUpperCase();
              
              return (
                <Card key={index} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-32 w-32 border-4 border-background">
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      {member.role}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Join Our Educational Revolution
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
                Whether you're a student looking for guidance or a tutor wanting to share your knowledge, become part of our community today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {!user ? (
                <LoginDialog>
                  <Button className="bg-background text-foreground hover:bg-background/90 px-8">
                    Get Started For Free
                  </Button>
                </LoginDialog>
              ) : (
                <>
                  <Button className="bg-background text-foreground hover:bg-background/90">
                    Find a Tutor
                  </Button>
                  <Button variant="outline" className="bg-transparent border-background text-background hover:bg-background/10">
                    Become a Tutor
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutClient;