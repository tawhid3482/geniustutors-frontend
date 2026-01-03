"use client"
import { useState, useMemo, useEffect } from "react";
import { useGetAllCourseQuery } from "@/redux/features/course/courseApi";
import { ICourse } from "@/types/common";
import { 
  Clock, 
  Award, 
  Search, 
  Filter, 
  X, 
  Star,
  TrendingUp,
  BookOpen,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

const CoursesPage = () => {
  const { data: allCourses, isLoading } = useGetAllCourseQuery(undefined);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Extract courses from API response
  const courses: ICourse[] = useMemo(() => {
    if (!allCourses) return [];
    
    if (Array.isArray(allCourses)) {
      return allCourses;
    } else if (Array.isArray(allCourses.data)) {
      return allCourses.data;
    } else if (allCourses.data && Array.isArray(allCourses.data.data)) {
      return allCourses.data.data;
    }
    
    return [];
  }, [allCourses]);

  // Get published courses
  const publishedCourses = courses.filter((course: ICourse) => course.status === 'published');

  // Get unique categories and levels for filters
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(publishedCourses.map(course => course.category)));
    return ["all", ...uniqueCategories];
  }, [publishedCourses]);

  const levels = useMemo(() => {
    const uniqueLevels = Array.from(new Set(publishedCourses.map(course => course.level)));
    return ["all", ...uniqueLevels];
  }, [publishedCourses]);

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return publishedCourses.filter((course: ICourse) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.tags && course.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      // Category filter
      const matchesCategory = selectedCategory === "all" || 
        course.category === selectedCategory;

      // Level filter
      const matchesLevel = selectedLevel === "all" || 
        course.level === selectedLevel;

      // Price filter
      const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [publishedCourses, searchTerm, selectedCategory, selectedLevel, priceRange]);

  // Get max price for range slider
  const maxPrice = useMemo(() => {
    if (publishedCourses.length === 0) return 10000;
    return Math.max(...publishedCourses.map(course => course.price));
  }, [publishedCourses]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setPriceRange([0, maxPrice]);
  };

  // Format price to Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Course</h1>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              Browse through {publishedCourses.length} published courses and start your learning journey today
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Filter Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== "all").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  {levels.filter(level => level !== "all").map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {(selectedCategory !== "all" || selectedLevel !== "all" || searchTerm || priceRange[1] < maxPrice) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 font-medium"
                >
                  <X className="w-5 h-5" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(cat => cat !== "all").map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Levels</option>
                    {levels.filter(level => level !== "all").map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>

                {(selectedCategory !== "all" || selectedLevel !== "all" || searchTerm || priceRange[1] < maxPrice) && (
                  <div className="md:col-span-2">
                    <button
                      onClick={resetFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg"
                    >
                      <X className="w-5 h-5" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredCourses.length} Courses Found
            </h2>
            <p className="text-gray-600 mt-1">
              {searchTerm && (
                <>
                  Showing results for "<span className="font-semibold">{searchTerm}</span>"
                  {selectedCategory !== "all" && ` in ${selectedCategory}`}
                </>
              )}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Sorted by: <span className="font-medium text-gray-700">Popularity</span>
            </div>
            {(selectedCategory !== "all" || selectedLevel !== "all" || searchTerm || priceRange[1] < maxPrice) && (
              <button
                onClick={resetFilters}
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Courses Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? `No courses match "${searchTerm}". Try adjusting your search or filters.`
                : "No courses match your current filters. Try adjusting them to find what you're looking for."}
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <X className="w-5 h-5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course: ICourse) => (
                <Link 
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
                    {/* Course Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={course.thumbnail_url || "/placeholder.jpg"} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                          {course.level}
                        </span>
                        {course.certificate_available && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center">
                            <Award className="w-3 h-3 mr-1" />
                            Certificate
                          </span>
                        )}
                      </div>
                      {/* Discount Badge */}
                      {course.original_price > course.price && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                          Save {Math.round((1 - course.price / course.original_price) * 100)}%
                        </div>
                      )}
                    </div>
                    
                    {/* Course Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {course.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <span>4.8</span>
                          <span className="ml-1">(1.2k)</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                        {course.short_description}
                      </p>
                      
                      {/* Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {course.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{course.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-gray-100">
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
                  </div>b
                </Link>
              ))}
            </div>

            {filteredCourses.length > 9 && (
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors">
                  Load More Courses
                </button>
              </div>
            )}
          </>
        )}
      </div>

     
    </div>
  );
};

export default CoursesPage;