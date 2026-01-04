"use client";

import React, { useEffect, useState } from "react";
import { useGetAllCourseQuery } from "@/redux/features/course/courseApi";
import {
  CheckCircle,
  Clock,
  Users,
  Globe,
  Home,
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Tag,
  BarChart,
  Target,
  FileText,
  Award,
  Settings,
  Calendar,
  Play,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { ICourse } from "@/types/common";
import StudentEnroll from "./StudentEnroll";
import { useGetAllEnrollmentUserQuery } from "@/redux/features/area/enrollments/enrollmentsApi";
import { useAuth } from "@/contexts/AuthContext.next";

interface CourseDetailsProps {
  courseSlug: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ courseSlug }) => {
  const [isClient, setIsClient] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const { data: allCourses, isLoading } = useGetAllCourseQuery(undefined);
  const [course, setCourse] = useState<ICourse | null>(null);
  const { user } = useAuth();

  // Fetch user's enrollments
  const { data: enrollmentResponse, isLoading: enrollmentLoading } = useGetAllEnrollmentUserQuery(user?.id, {
    skip: !user?.id,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (allCourses) {
      let coursesArray: ICourse[] = [];

      if (Array.isArray(allCourses)) {
        coursesArray = allCourses;
      } else if (Array.isArray(allCourses.data)) {
        coursesArray = allCourses.data;
      } else if (allCourses.data && Array.isArray(allCourses.data.data)) {
        coursesArray = allCourses.data.data;
      }

      if (coursesArray.length > 0) {
        const foundCourse = coursesArray.find(
          (c: ICourse) => c.slug === courseSlug
        );

        if (foundCourse && foundCourse.status === "published") {
          const { video_url, ...courseWithoutVideo } = foundCourse;
          setCourse(courseWithoutVideo as ICourse);
        }
      }
    }
  }, [allCourses, courseSlug]);

  // Check if user is enrolled in this course
  const isEnrolled = () => {
    if (!enrollmentResponse?.data || !course) return false;
    
    const enrollments = enrollmentResponse.data;
    return enrollments.some(
      (enrollment: any) => 
        enrollment.courseId === course.id 
    );
  };



  // Get enrollment status
  const getEnrollmentStatus = () => {
    if (!enrollmentResponse?.data || !course) return null;
    
    const enrollments = enrollmentResponse.data;
    const userEnrollment = enrollments.find(
      (enrollment: any) => enrollment.courseId === course.id
    );
    
    return userEnrollment?.status || null;
  };

  // YouTube video ID extract function
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleEnrollClick = (): void => {
    setShowEnrollModal(true);
  };

  const handleContinueCourse = (): void => {
    // Redirect to course content page
    window.location.href = `/dashboard`;
  };

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
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Course Not Found
          </h2>
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const videoId = course.video_intro_url
    ? getYouTubeVideoId(course.video_intro_url)
    : null;

  // Render appropriate button based on enrollment status
  const renderEnrollmentButton = () => {
    if (!user) {
      return (
        <Link
          href="/login"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 mb-4 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          Login to Enroll
        </Link>
      );
    }

    if (isEnrolled()) {
      return (
        <button
          onClick={handleContinueCourse}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-800 mb-4 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Already Enrolled - Continue Course
        </button>
      );
    }

 

    return (
      <button
        onClick={handleEnrollClick}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-800 mb-4 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Enroll Now
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Enrollment Modal */}
      {showEnrollModal && (
        <StudentEnroll
          courseId={course.id}
          courseTitle={course.title}
          coursePrice={course.price}
          onClose={() => setShowEnrollModal(false)}
        />
      )}

      {/* Video Modal */}
      {showVideoModal && videoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-black rounded-lg overflow-hidden">
              <div className="relative pt-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title="Course Introduction Video"
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span className="text-blue-600 font-medium">{course.title}</span>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center text-sm hover:text-green-600"
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
                <div className="lg:w-1/3 relative group">
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => course.video_intro_url && setShowVideoModal(true)}
                  >
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {course.video_intro_url && (
                      <>
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white bg-opacity-90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-10 h-10 text-red-600 fill-current" />
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <Video className="w-3 h-3 mr-1" />
                          Intro
                        </div>
                      </>
                    )}
                  </div>
                  {course.video_intro_url && (
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Introduction
                    </button>
                  )}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-semibold">Course Level:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded">
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold">Category:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-bold rounded">
                        {course.category}
                      </span>
                    </div>
                  </div>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
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
                      <div className="text-xs text-gray-500">Max Students</div>
                    </div>
                    <div className="text-center">
                      <Settings className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-bold">{course.status}</div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Short Description */}
            {course.short_description && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  Course Overview
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {course.short_description}
                </p>
              </div>
            )}

            {/* Learning Outcomes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-green-600" />
                Learning Outcomes
              </h2>
              <ul className="space-y-4">
                {course.learning_outcomes
                  .split(".")
                  .filter(Boolean)
                  .map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                      <span className="text-gray-800">{outcome.trim()}.</span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Requirements */}
            {course.requirements && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart className="w-6 h-6 mr-3 text-orange-600" />
                  Prerequisites
                </h2>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {course.requirements}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  We Covered
                </h2>
                <div className="flex flex-wrap gap-3">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ৳{course.price}
                  </span>
                  {course.original_price > course.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through ml-3">
                        ৳{course.original_price}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm font-bold rounded">
                        Save ৳{course.original_price - course.price}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600">
                  One-time payment • Lifetime access
                </p>
              </div>

              {renderEnrollmentButton()}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Full lifetime access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    {course.duration_hours} hours of content
                  </span>
                </div>
                {course.certificate_available && (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Certificate of completion
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Access on mobile and desktop
                  </span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-bold text-xl mb-6 text-gray-900 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                Course Details
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600 flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    Category
                  </span>
                  <span className="font-medium">{course.category}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600 flex items-center">
                    <BarChart className="w-4 h-4 mr-2" />
                    Level
                  </span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </span>
                  <span className="font-medium">
                    {course.duration_hours} hours
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Language
                  </span>
                  <span className="font-medium">{course.language}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Max Students
                  </span>
                  <span className="font-medium">{course.max_students}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </span>
                  <span className="font-medium">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      course.status === "published"
                        ? "bg-green-100 text-green-800"
                        : course.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Info */}
            {course.certificate_available && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-yellow-600 mr-3" />
                  <h4 className="font-bold text-lg text-gray-900">
                    Certificate
                  </h4>
                </div>
                <p className="text-gray-700 mb-4">
                  This course includes a certificate of completion that you can
                  share with your professional network.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">
                      Industry recognized certificate
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">Digital certificate format</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">Verifiable online</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;