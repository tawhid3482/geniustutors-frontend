'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className 
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7; // Show up to 7 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show first 5 pages + ellipsis + last page
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('...');
        }
        if (totalPages > 5) {
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        if (totalPages > 6) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current page and neighbors + ellipsis + last page
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 border border-gray-300 bg-white hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4 text-gray-600" />
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
  <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-gray-500 text-sm"
  >
              ...
  </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              "h-8 w-8 p-0 text-sm font-medium",
              isActive
                ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                : "border border-gray-300 bg-white hover:bg-gray-50 text-blue-600"
            )}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 border border-gray-300 bg-white hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4 text-gray-600" />
      </Button>
    </div>
  );
}