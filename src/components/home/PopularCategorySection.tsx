"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categoryService, CategoryData } from "@/services/categoryService";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";

interface Category {
  id: string;
  name: string;
  iconUrl?: string;
  color: string;
  icon: string;
  tuitions?: number; // Optional field for tuition count
}

export function PopularCategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const router = useRouter();

  const { data: categoryData, isLoading, error } = useGetAllCategoryQuery(undefined);

 
  useEffect(() => {
    if (categoryData?.data) {
      // Add tuition count to each category (you can modify this based on your actual data)
      const categoriesWithTuitions = categoryData.data.map((category: any) => ({
        ...category,
      }));
      setCategories(categoriesWithTuitions);
    }
  }, [categoryData]);


  const handleCategoryClick = (categoryName: string) => {
    // Navigate to tuition-jobs page with category filter applied
    router.push(`/tuition-jobs?category=${encodeURIComponent(categoryName)}`);
  };

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              CHOOSE YOUR <span className="text-primary">CATEGORY</span>
            </h2>
            <p className="text-gray-600 text-lg mb-6">Loading categories...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border p-4 text-center animate-pulse"
              >
                <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              CHOOSE YOUR <span className="text-primary">CATEGORY</span>
            </h2>
            <p className="text-red-600 text-lg mb-6">Failed to load categories. Please try again.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            CHOOSE YOUR <span className="text-primary">CATEGORY</span>
          </h2>
        </div>

        {/* View All button */}
        <div className="flex justify-end mb-8 px-4">
          <Link href="/categories">
            <button className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
              View All
            </button>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white rounded-lg border p-4 text-center relative hover:ring-2 hover:ring-primary/20"
              onClick={() => handleCategoryClick(category.name)}
            >
              {/* Arrow icon */}
              <div className="absolute top-2 right-2 text-primary opacity-60">
                ↗
              </div>

              {/* Category icon */}
              <div className="mb-3 flex justify-center">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  {category.iconUrl && !imageErrors.has(category.id) ? (
                    <img
                      src={category.iconUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(category.id)}
                      onLoad={() => {
                        // Remove from error set if image loads successfully
                        setImageErrors((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(category.id);
                          return newSet;
                        });
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Category name */}
              <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight">
                {category.name}
              </h3>

              {/* Tuition count */}
              <p className="text-primary font-bold text-lg">
                {category.tuitions }
              </p>
              <p className="text-gray-600 text-xs">Tuitions</p>

              {/* Click indicator */}
              <p className="text-xs text-primary mt-2 opacity-70">
                Click to view jobs
              </p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {categories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}