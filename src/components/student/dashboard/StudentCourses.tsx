"use client";

import { useAuth } from "@/contexts/AuthContext.next";
import { useGetStudentEnrollmentCoursesQuery } from "@/redux/features/area/enrollments/enrollmentsApi";
import React, { useState, useEffect } from "react";
import {
  Play,
  BookOpen,
  Clock,
  Users,
  Award,
  Calendar,
  Eye,
  ChevronRight,
  Search,
  Filter,
  Video,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  level: string;
  price: number;
  original_price: number;
  thumbnail_url: string;
  video_intro_url: string;
  video_url: string;
  duration_hours: number;
  certificate_available: boolean;
  max_students: number;
  language: string;
  tags: string[];
  requirements: string;
  learning_outcomes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  status: "active" | "inactive" | "completed";
  course: Course;
}

export function StudentCourses() {
  const { user } = useAuth();
  const { data: myCoursesResponse, isLoading, error } = useGetStudentEnrollmentCoursesQuery(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Enrollment | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentType, setContentType] = useState<"video" | "ebook" | "external" | "unknown">("unknown");

  const myCourses: Enrollment[] = myCoursesResponse?.data || [];

  // Detect content type based on URL
  const detectContentType = (url: string): "video" | "ebook" | "external" | "unknown" => {
    if (!url) return "unknown";
    
    // Video patterns
    const videoPatterns = [
      /youtube\.com|youtu\.be/,
      /vimeo\.com/,
      /\.mp4$/,
      /\.webm$/,
      /\.mov$/,
      /\.avi$/,
      /\.mkv$/,
      /dailymotion\.com/,
      /streamable\.com/,
      /twitch\.tv/,
    ];
    
    // Ebook/PDF patterns (for direct viewing)
    const ebookPatterns = [
      /\.pdf$/,
      /\.epub$/,
      /\.mobi$/,
      /\.azw3$/,
      /docs\.google\.com\/document/,
      /docs\.google\.com\/presentation/,
    ];
    
    // Flipbook/Embeddable patterns
    const embeddablePatterns = [
      /heyzine\.com/,
      /flipbook/,
      /issuu\.com/,
      /flippingbook\.com/,
      /calameo\.com/,
      /anyflip\.com/,
      /pubhtml5\.com/,
    ];

    if (videoPatterns.some(pattern => pattern.test(url))) return "video";
    if (ebookPatterns.some(pattern => pattern.test(url))) return "ebook";
    if (embeddablePatterns.some(pattern => pattern.test(url))) return "ebook";
    
    // For other links, treat as external
    return "external";
  };

  // Check if URL can be embedded
  const canEmbedUrl = (url: string): boolean => {
    if (!url) return false;
    
    const embeddableDomains = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'heyzine.com',
      'issuu.com',
      'flippingbook.com',
      'calameo.com',
      'anyflip.com',
      'pubhtml5.com',
      'docs.google.com',
    ];
    
    try {
      const urlObj = new URL(url);
      return embeddableDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showContentModal) {
        setShowContentModal(false);
      }
    };

    // Prevent scrolling when modal is open
    if (showContentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [showContentModal]);

  // YouTube video ID extract function
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Vimeo video ID extract function
  const getVimeoVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter courses
  const filteredCourses = myCourses.filter((enrollment) => {
    const matchesSearch = enrollment.course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      enrollment.course.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle course content view
  const handleViewContent = (enrollment: Enrollment) => {
    setSelectedCourse(enrollment);
    const type = detectContentType(enrollment.course.video_url);
    setContentType(type);
    setShowContentModal(true);
  };

  // Render content based on type
  const renderContent = () => {
    if (!selectedCourse?.course.video_url) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Content Not Available
          </h4>
          <p className="text-gray-600 text-center max-w-md">
            No content URL provided for this course.
          </p>
        </div>
      );
    }

    const url = selectedCourse.course.video_url;
    const canEmbed = canEmbedUrl(url);

    switch (contentType) {
      case "video":
        if (url.includes("youtube") || url.includes("youtu.be")) {
          const videoId = getYouTubeVideoId(url);
          return (
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={selectedCourse.course.title}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        } else if (url.includes("vimeo")) {
          const videoId = getVimeoVideoId(url);
          return (
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
                title={selectedCourse.course.title}
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        } else {
          return (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={url}
                controls
                className="w-full max-h-[70vh]"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }

      case "ebook":
        if (url.includes(".pdf")) {
          return (
            <div className="relative w-full h-[70vh] rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                className="w-full h-full"
                title={selectedCourse.course.title}
              />
            </div>
          );
        } else if (canEmbed) {
          return (
            <div className="relative w-full h-[70vh] rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={url}
                title={selectedCourse.course.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          );
        } else {
          return renderExternalContent();
        }

      case "external":
        return renderExternalContent();

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Unsupported Content Type
            </h4>
            <p className="text-gray-600 text-center max-w-md mb-6">
              This content type is not supported for direct viewing.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Content
            </a>
          </div>
        );
    }
  };

  const renderExternalContent = () => {
    const url = selectedCourse!.course.video_url;
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Globe className="w-16 h-16 text-blue-600 mb-4" />
        <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          External Content
        </h4>
        <p className="text-gray-600 text-center max-w-md mb-4">
          This content is hosted externally. Click the button below to open it in a new tab.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg mb-6 w-full max-w-md">
          <p className="text-sm font-mono text-gray-700 break-all">
            {url}
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Open Content
        </a>
      </div>
    );
  };

  // Get content icon
  const getContentIcon = (url: string) => {
    const type = detectContentType(url);
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "ebook": return <BookOpen className="w-4 h-4" />;
      case "external": return <ExternalLink className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  // Get content label
  const getContentLabel = (url: string) => {
    const type = detectContentType(url);
    switch (type) {
      case "video": return "Video";
      case "ebook": return "Ebook";
      case "external": return "Link";
      default: return "Content";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Courses
          </h3>
          <p className="text-gray-600 mb-6">
            There was an error loading your courses. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Please Login
          </h3>
          <p className="text-gray-600 mb-6">
            You need to login to view your enrolled courses.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content Modal */}
      {showContentModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                  {selectedCourse.course.title}
                </h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  {getContentIcon(selectedCourse.course.video_url)}
                  <span>{getContentLabel(selectedCourse.course.video_url)} Content</span>
                </p>
              </div>
              <button
                onClick={() => setShowContentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="h-full">
                {renderContent()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Enrolled on:</span> {formatDate(selectedCourse.enrolledAt)}
                  {selectedCourse.course.certificate_available && (
                    <span className="ml-4 inline-flex items-center text-green-600">
                      <Award className="w-4 h-4 mr-1" />
                      Certificate available
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-2">
                View and access all your enrolled courses
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {myCourses.length} Courses
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  {myCourses.filter(c => c.status === "active").length} Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No courses match your search criteria. Try adjusting your filters."
                : "You haven't enrolled in any courses yet."}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Browse Courses
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((enrollment) => {
              const contentLabel = getContentLabel(enrollment.course.video_url);
              const isContentAvailable = enrollment.course.video_url;

              return (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={enrollment.course.thumbnail_url}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          enrollment.status === "active"
                            ? "bg-green-100 text-green-800"
                            : enrollment.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {enrollment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {enrollment.course.level}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                        {enrollment.course.category}
                      </span>
                      {enrollment.course.certificate_available && (
                        <Award className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {enrollment.course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {enrollment.course.short_description}
                    </p>

                    {/* Course Info */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{enrollment.course.duration_hours}h</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{enrollment.course.language}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {formatDate(enrollment.enrolledAt)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        {getContentIcon(enrollment.course.video_url)}
                        <span className="text-sm ml-2">{contentLabel}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {enrollment.course.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {enrollment.course.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{enrollment.course.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {isContentAvailable ? (
                        <button
                          onClick={() => handleViewContent(enrollment)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                        >
                          {contentLabel === "Video" ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Watch Content
                            </>
                          ) : contentLabel === "Ebook" ? (
                            <>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Read Content
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View Content
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          Content Unavailable
                        </button>
                      )}

                      <Link
                        href={`/courses/${enrollment.course.slug}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {filteredCourses.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{myCourses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myCourses.filter(c => c.status === "active").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myCourses.filter(c => c.status === "inactive").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">With Certificate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myCourses.filter(c => c.course.certificate_available).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}