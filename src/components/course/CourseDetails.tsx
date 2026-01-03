"use client"
import React, { useEffect, useState } from 'react';
import { useGetAllCourseQuery } from "@/redux/features/course/courseApi";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Globe, 
  Tag, 
  Calendar, 
  Award, 
  BookOpen, 
  Video,
  Home,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { ICourse } from '@/types/common';

interface CourseDetailsProps {
  courseSlug: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ courseSlug }) => {
  const [isClient, setIsClient] = useState(false);
  const { data: allCourses, isLoading } = useGetAllCourseQuery(undefined);
  const [course, setCourse] = useState<ICourse | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (allCourses) {
      // Handle API response structure
      let coursesArray: ICourse[] = [];
      
      if (Array.isArray(allCourses)) {
        coursesArray = allCourses;
      } else if (Array.isArray(allCourses.data)) {
        coursesArray = allCourses.data;
      } else if (allCourses.data && Array.isArray(allCourses.data.data)) {
        coursesArray = allCourses.data.data;
      }

      if (coursesArray.length > 0) {
        const foundCourse = coursesArray.find((c: ICourse) => c.slug === courseSlug);
        
        if (foundCourse && foundCourse.status === 'published') {
          setCourse(foundCourse);
        }
      }
    }
  }, [allCourses, courseSlug]);

  // Handle client-side rendering
  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Course Not Found</h2>
          <Link 
            href="/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEnroll = (): void => {
    alert("Enrollment feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="hover:text-blue-600">
                <Home className="w-5 h-5" />
              </Link>
              <span>/</span>
              <Link href="/courses" className="hover:text-blue-600">
                Courses
              </Link>
              <span>/</span>
              <span className="text-blue-600 font-medium">
                {course.title}
              </span>
            </div>
            <Link 
              href="/courses"
              className="inline-flex items-center text-sm hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              All Courses
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3">
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                      {course.level}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                      {course.category}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {course.title}
                  </h1>
                  
                  <p className="text-gray-700 text-lg mb-6">
                    {course.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-bold">{course.duration_hours}h</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <Globe className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="font-bold">{course.language}</div>
                      <div className="text-xs text-gray-500">Language</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold">{course.max_students}</div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What You'll Learn
              </h2>
              <ul className="space-y-4">
                {course.learning_outcomes.split('.').filter(Boolean).map((outcome, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1" />
                    <span className="text-gray-800">{outcome.trim()}.</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{course.price}
                  </span>
                  {course.original_price > course.price && (
                    <span className="text-lg text-gray-500 line-through ml-3">
                      ₹{course.original_price}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">One-time payment</p>
              </div>

              <button
                onClick={handleEnroll}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 mb-4"
              >
                Enroll Now
              </button>

              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>{course.duration_hours} hours of content</span>
                </div>
                {course.certificate_available && (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Certificate of completion</span>
                  </div>
                )}
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-bold text-lg mb-4">Course Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{course.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(course.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    course.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;