"use client";
import { useAuth } from "@/contexts/AuthContext.next";
import { useGetAllTutorDueQuery } from "@/redux/features/AssignTutor/AssignTutorApi";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  User,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const TutorDue = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: DueData, isLoading, error } = useGetAllTutorDueQuery(userId);
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get payment status
  const getPaymentStatus = (due: any) => {
    if (due.paidAmount >= due.payableAmount)
      return { label: "Paid", color: "green", icon: CheckCircle };
    if (due.paidAmount > 0)
      return { label: "Partial", color: "amber", icon: AlertCircle };
    return { label: "Unpaid", color: "red", icon: XCircle };
  };

  // Calculate progress percentage
  const getProgressPercentage = (due: any) => {
    if (due.payableAmount === 0) return 0;
    return Math.round((due.paidAmount / due.payableAmount) * 100);
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!DueData?.data) return [];

    let result = DueData.data.filter((due: any) => {
      const matchesSearch =
        due.tutorId?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        due.tutor?.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        due.tutor?.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        due.tutor?.phone?.includes(debouncedSearch);

      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "paid" && due.paidAmount >= due.payableAmount) ||
        (statusFilter === "partial" &&
          due.paidAmount > 0 &&
          due.paidAmount < due.payableAmount) ||
        (statusFilter === "unpaid" && due.paidAmount === 0);

      return matchesSearch && matchesFilter;
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a:any, b:any) => {
        if (sortConfig.key === "dueAmount") {
          return sortConfig.direction === "ascending"
            ? a.dueAmount - b.dueAmount
            : b.dueAmount - a.dueAmount;
        }

        if (sortConfig.key === "tutorName") {
          const nameA = a.tutor?.fullName || "";
          const nameB = b.tutor?.fullName || "";
          return sortConfig.direction === "ascending"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }

        return 0;
      });
    }

    return result;
  }, [DueData?.data, debouncedSearch, statusFilter, sortConfig]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!DueData?.data) return { payable: 0, paid: 0, due: 0 };
    
    return DueData.data.reduce(
      (acc: any, due: any) => ({
        payable: acc.payable + due.payableAmount,
        paid: acc.paid + due.paidAmount,
        due: acc.due + due.dueAmount,
      }),
      { payable: 0, paid: 0, due: 0 }
    );
  }, [DueData?.data]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (key: any) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-xl font-semibold text-red-700">
                  Error Loading Data
                </h3>
                <p className="text-red-600 mt-1">
                  Failed to load tutor dues. Please try again later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!DueData?.data || DueData.data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Dues Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are currently no tutor dues to display. All payments might
              be settled or no tutors have been assigned yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tutor Platform Dues
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all tutor payments and dues
              </p>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Payable</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totals.payable)}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.paid)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Due</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totals.due)}
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                <input
                  type="text"
                  placeholder="Search by tutor ID, name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-green-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setSortConfig({ key: null, direction: "ascending" });
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tutor
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("dueAmount")}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Due Amount
                      {sortConfig.key === "dueAmount" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Payable
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Paid
                    </span>
                  </th>
                  <th className="px6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Progress
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((due:any, index:any) => {
                  const status = getPaymentStatus(due);
                  const progress = getProgressPercentage(due);
                  const isExpanded = expandedRow === index;

                  return (
                    <React.Fragment key={due.id}>
                      <tr
                        className={`hover:bg-gray-50 ${
                          isExpanded ? "bg-blue-50" : ""
                        }`}
                      >
                        {/* Tutor Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {due.tutor?.avatar ? (
                              <img
                                src={due.tutor.avatar}
                                alt={due.tutor.fullName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {due.tutor?.fullName || `Tutor ${due.tutorId}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {due.tutorId}
                              </div>
                              {due.tutor && (
                                <div className="">
                                  <div className="text-xs flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {due.tutor.email}
                                  </div>
                                  <div className="text-xs  flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {due.tutor.phone}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Due Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(due.dueAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(due.updatedAt)}
                          </div>
                        </td>

                        {/* Payable Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 font-medium">
                            {formatCurrency(due.payableAmount)}
                          </div>
                        </td>

                        {/* Paid Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`font-medium ${
                              due.paidAmount > 0
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {formatCurrency(due.paidAmount)}
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="px-6 py-4">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">{progress}%</span>
                              <span className="text-gray-500">
                                {due.paidAmount}/{due.payableAmount}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  progress === 100
                                    ? "bg-green-500"
                                    : progress > 0
                                    ? "bg-blue-500"
                                    : "bg-gray-400"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer - Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200">
              {/* Items info */}
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
              </div>

              {/* Page controls */}
              <div className="flex items-center space-x-4">
                {/* Page size selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                {/* Pagination buttons */}
                <nav className="flex items-center space-x-1">
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Page numbers */}
                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight className="w-5 h-5 text-gray-600" />
                  </button>
                </nav>

                {/* Page info */}
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDue;