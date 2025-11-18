'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LoginDialog } from "@/components/auth/LoginDialog";

export const TuitionTypesSection = () => {
  const tuitionTypes = [
    {
      id: 1,
      title: "Home Tutoring",
      description: "It's a unique opportunity to learn in the home with your scheduled hours in a refined classroom everything in a favor of your need.",
      image: "/home-tutoring.svg",
      bgColor: "bg-purple-50",
      accentColor: "from-purple-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Online Tutoring",
      description: "Connect with the best tutors from anywhere and take online courses by world-different faces.Share your life more easier with this process.",
      image: "/online-tutoring.svg",
      bgColor: "bg-blue-50",
      accentColor: "from-blue-500 to-cyan-600"
    },
    {
      id: 3,
      title: "Group Tutoring",
      description: "A group of students can find it more hunger for learning within more affordable tuition fees. Get the opportunity of sharing with knowledge others.",
      image: "/group-tutoring.svg",
      bgColor: "bg-green-50",
      accentColor: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section className="py-8 xs:py-10 sm:py-12 md:py-14 bg-gradient-to-b from-muted/20 to-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16" 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl xs:text-3xl lg:text-4xl font-bold text-foreground mb-2 xs:mb-3 sm:mb-4">
            Tuition Types
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Find the Best Tuition Type which suits you most
          </p>
        </motion.div>

        {/* Tuition Types Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-10 xs:mb-12 sm:mb-16 md:mb-20">
          {tuitionTypes.map((type) => (
            <motion.div
              key={type.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 100, damping: 12 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="group hover:shadow-xl transition-all duration-500 relative overflow-hidden border-0 h-full bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center">
                    {/* Image with colored background */}
                    <div className={`w-full aspect-square ${type.bgColor} flex items-center justify-center p-4 xs:p-6 sm:p-8 relative overflow-hidden group-hover:bg-white transition-colors duration-500`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${type.accentColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${type.accentColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                      <div className="w-24 h-24 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 relative transition-transform duration-500 group-hover:scale-110">
                        <img 
                          src={type.image} 
                          alt={type.title} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 xs:p-6 sm:p-8 text-center">
                      <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-foreground mb-2 xs:mb-3 group-hover:text-primary transition-colors duration-300">
                        {type.title}
                      </h3>
                      <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed mb-2 xs:mb-3 sm:mb-4">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Become a Tutor CTA */}
        <motion.div 
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl xs:rounded-2xl p-5 xs:p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between border border-primary/10 shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full -mr-16 xs:-mr-24 sm:-mr-32 -mt-16 xs:-mt-24 sm:-mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full -ml-16 xs:-ml-24 sm:-ml-32 -mb-16 xs:-mb-24 sm:-mb-32 blur-3xl"></div>
          <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-0 relative z-10 text-center md:text-left">
            <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-2 xs:mb-3">
              <span className="text-black dark:text-white">WANT TO BECOME </span>
              <span className="text-primary">TUTOR</span>
            </h3>
            <p className="text-xs xs:text-sm sm:text-base text-black dark:text-gray-300">
              Let's Work Together & Explore Opportunities
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <LoginDialog>
              <Button 
                data-auth-type="register"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 md:py-6 rounded-lg xs:rounded-xl text-sm xs:text-base sm:text-lg shadow-md hover:shadow-xl transition-all duration-300 relative z-10"
              >
                Register
              </Button>
            </LoginDialog>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
