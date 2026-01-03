"use client"
import { ICourse } from '@/types/common';
import { Clock, Award } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
  course: ICourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link 
      href={`/courses/${course.slug}`}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={course.thumbnail_url || "/api/placeholder/400/300"} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/api/placeholder/400/300";
            }}
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              {course.level}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{course.category}</span>
            {course.certificate_available && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                <Award className="w-3 h-3 mr-1" />
                Certificate
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.short_description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(course.tags) && course.tags.slice(0, 3).map((tag: string, index: number) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {Array.isArray(course.tags) && course.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{course.tags.length - 3} more
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                ₹{course.price?.toLocaleString() || "0"}
              </span>
              {course.original_price > course.price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{course.original_price?.toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {course.duration_hours}h
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;