"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  MessageCircle, 
  Users, 
  ExternalLink,
  Heart,
  Share2,
  Bell
} from "lucide-react";

interface SocialMediaPlatform {
  id: string;
  name: string;
  description: string;
  icon: any;
  url: string;
  followers: string;
  color: string;
  action: string;
  verified?: boolean;
}

export function JoinCommunity() {
  const socialMediaPlatforms: SocialMediaPlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Join our Facebook community for updates, discussions, and networking with fellow students and tutors.',
      icon: Facebook,
      url: 'https://facebook.com/tutorconnect',
      followers: '15.2K',
      color: 'bg-green-600',
      action: 'Join Group',
      verified: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Follow us for inspiring success stories, study tips, and behind-the-scenes content.',
      icon: Instagram,
      url: 'https://instagram.com/tutorconnect',
      followers: '8.7K',
      color: 'bg-green-600',
      action: 'Follow',
      verified: true
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Subscribe to our channel for educational videos, tutorials, and success stories.',
      icon: Youtube,
      url: 'https://youtube.com/@tutorconnect',
      followers: '12.5K',
      color: 'bg-green-600',
      action: 'Subscribe',
      verified: true
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Stay updated with the latest news, tips, and announcements from our platform.',
      icon: Twitter,
      url: 'https://twitter.com/tutorconnect',
      followers: '6.3K',
      color: 'bg-green-600',
      action: 'Follow',
      verified: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect with professionals, tutors, and students in our LinkedIn community.',
      icon: Linkedin,
      url: 'https://linkedin.com/company/tutorconnect',
      followers: '4.1K',
      color: 'bg-green-600',
      action: 'Connect',
      verified: true
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Join our Discord server for real-time discussions, study groups, and community support.',
      icon: MessageCircle,
      url: 'https://discord.gg/tutorconnect',
      followers: '2.8K',
      color: 'bg-green-600',
      action: 'Join Server'
    }
  ];

  const handleSocialMediaClick = (platform: SocialMediaPlatform) => {
    window.open(platform.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Join Our Community</h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Connect with thousands of students and tutors across our social media platforms. 
            Get updates, share experiences, and be part of our growing educational community.
          </p>
        </div>
      </div>


      {/* Social Media Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialMediaPlatforms.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <Card key={platform.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${platform.color} text-white mb-4`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl mb-4">{platform.name}</CardTitle>
                <Button 
                  onClick={() => handleSocialMediaClick(platform)}
                  className={`w-full ${platform.color} hover:opacity-90 text-white`}
                >
                  {platform.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
