'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categoryService, CategoryData } from "@/services/categoryService";

export default function CategoriesPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch categories data function
  const fetchCategoriesData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Get all categories from service
      const data = await categoryService.getAllCategories();
      
      setCategories(data);
      setFilteredCategories(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching categories data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    fetchCategoriesData();

    const interval = setInterval(() => {
      fetchCategoriesData(true);
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchCategoriesData]);

  useEffect(() => {
    // Only redirect student and tutor users, allow admin users to access categories page
    if (user && user.role === 'student') {
      router.push('/dashboard');
    }
    if (user && user.role === 'tutor') {
      router.push('/tutor');
    }
    // Admin users (admin, super_admin) can access the categories page
  }, [user, router]);

  // Real-time search functionality
  useEffect(() => {
    if (categories && categories.length > 0) {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to tuition-jobs page with category filter applied
    const encodedCategory = encodeURIComponent(categoryName);
    router.push(`/tuition-jobs?category=${encodedCategory}`);
  };

  const handleRefresh = () => {
    fetchCategoriesData(true);
  };

  // Only show loading spinner for student and tutor users, not admin users
  if (user && (user.role === 'student' || user.role === 'tutor')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar 
        user={user ? {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        } : undefined}
        onLogout={handleLogout}
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                <span className="text-primary">ALL</span> CATEGORIES
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Explore all available tuition categories and subjects
              </p>
              
              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-sm">⚠️ {error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Real-time info and refresh button */}
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
              <div className="text-center">
                <p className="text-gray-600">
                  Showing {filteredCategories.length} of {categories.length} categories
                </p>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer relative group"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {/* Arrow icon */}
                  <div className="absolute top-2 right-2 text-primary opacity-60">
                    ↗
                  </div>
                  
                  {/* Category icon */}
                  <div className={`${category.color} mb-3 flex justify-center text-2xl`}>
                    {category.iconUrl ? (
                      <img
                        src={category.iconUrl}
                        alt={`${category.name} icon`}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      category.icon
                    )}
                  </div>
                  
                  {/* Category name */}
                  <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight text-center">
                    {category.name}
                  </h3>
                  
                  {/* Tuition count */}
                  <div className="text-center mb-2">
                    <p className="text-primary font-bold text-lg">
                      {category.tuitions}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Tuitions
                    </p>
                  </div>
                  
                  {/* Click indicator */}
                  <p className="text-xs text-primary mt-2 text-center opacity-70">
                    Click to view jobs
                  </p>
                </div>
              ))}
            </div>

            {/* No results message */}
            {filteredCategories.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600">No categories found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary hover:underline mt-2"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}