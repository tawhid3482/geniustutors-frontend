'use client';

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
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const stats = [
    { label: "Students Served", value: "25,000+", icon: Users, color: "text-primary" },
    { label: "Verified Tutors", value: "5,000+", icon: Award, color: "text-success" },
    { label: "Success Rate", value: "95%", icon: TrendingUp, color: "text-warning" },
    { label: "Cities Covered", value: "20+", icon: Globe, color: "text-info" }
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
      image: "/placeholder.svg",
      bio: "Former education consultant with 15+ years of experience in EdTech and a passion for making quality education accessible to all."
    },
    {
      name: "Nusrat Jahan",
      role: "Chief Academic Officer",
      image: "/placeholder.svg",
      bio: "PhD in Education with extensive experience in curriculum development and educational psychology."
    },
    {
      name: "Kamal Hossain",
      role: "Head of Tutor Relations",
      image: "/placeholder.svg",
      bio: "Former university professor with a network of top educators across Bangladesh, ensuring we recruit only the best tutors."
    },
    {
      name: "Fariha Ahmed",
      role: "Customer Success Manager",
      image: "/placeholder.svg",
      bio: "Dedicated to ensuring both students and tutors have a seamless experience on our platform, with a background in customer experience design."
    }
  ];

  return (
    <div className="overflow-x-hidden w-full">
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
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Find a Tutor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Our Story
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                From a Small Idea to Bangladesh's Leading Tutoring Platform
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                Tutor Connect began in 2018 with a simple mission: to make quality education accessible to every student in Bangladesh, regardless of their location or economic background.
              </p>
              <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                What started as a small network of tutors in Dhaka has grown into the country's most trusted tutoring platform, connecting thousands of students with qualified tutors across multiple subjects and educational levels.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src="/placeholder.svg"
                  alt="Tutor Connect team"
                  className="object-cover w-full h-full"
                />
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
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Our Values
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                The Principles That Guide Us
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg/relaxed">
                These core values shape everything we do, from how we build our platform to how we interact with our community.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
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
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Our Team
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Meet the People Behind Tutor Connect
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg/relaxed">
                Our diverse team of educators, technologists, and education enthusiasts is united by a passion for transforming education.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <Card key={index} className="border-none shadow-sm overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover w-full h-full"
                  />
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Join Our Educational Revolution
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
                Whether you're a student looking for guidance or a tutor wanting to share your knowledge, become part of our community today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-background text-foreground hover:bg-background/90">
                Find a Tutor
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutClient;