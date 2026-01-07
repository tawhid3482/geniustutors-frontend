import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  Calendar,
  User,
  School,
  Globe,
  Clock,
  Check,
  Star,
  Crown,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  useGetAllTutorsQuery,
  useUpdateTutorStatusMutation,
} from "@/redux/features/tutorHub/tutorHubApi";

// --- Enhanced Type Definitions ---
type TutorStatus = "pending" | "approved" | "rejected";

interface Tutor {
  id: string;
  tutor_id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  nationality?: string;
  religion?: string;
  Institute_name?: string;
  department_name?: string;
  year?: string;
  district?: string;
  background?: string[];
  alternative_number?: string;
  qualification?: string;
  experience?: string;
  tutorStatus: TutorStatus;
  verified: boolean;
  genius: boolean;
  premium: boolean;
  createdAt: string;
}

interface StatusConfig {
  colorClasses: string;
  icon: string;
  label: string;
}

interface StatusConfigMap {
  pending: StatusConfig;
  approved: StatusConfig;
  rejected: StatusConfig;
}

// --- Pagination Component ---
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  // Calculate start and end items
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
      {/* Items info */}
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Page controls */}
      <div className="flex items-center space-x-4">
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page numbers */}
          {generatePageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
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
  );
};

// --- Status Cards Component ---
const StatusCard = ({ 
  label, 
  count, 
  isPrimary, 
  countColor 
}: { 
  label: string; 
  count: number; 
  isPrimary: boolean; 
  countColor: string;
}) => (
  <div
    className={`p-6 border rounded-xl shadow-sm transition-all duration-300 hover:shadow-md
      ${
        isPrimary
          ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 ring-2 ring-blue-100"
          : "bg-white border-gray-200"
      }`}
  >
    <div className={`text-3xl font-bold ${countColor} mb-2`}>{count}</div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
  </div>
);

const StatusCards = ({ tutors }: { tutors: Tutor[] }) => {
  const statusCounts = useMemo(() => {
    const total = tutors?.length || 0;
    const pending = tutors?.filter((tutor) => tutor.tutorStatus === "pending").length || 0;
    const approved = tutors?.filter((tutor) => tutor.tutorStatus === "approved").length || 0;
    const rejected = tutors?.filter((tutor) => tutor.tutorStatus === "rejected").length || 0;

    return { total, pending, approved, rejected };
  }, [tutors]);

  const statusItems = [
    {
      label: "Total Tutors",
      count: statusCounts.total,
      isPrimary: true,
      countColor: "text-gray-800",
    },
    {
      label: "Pending",
      count: statusCounts.pending,
      isPrimary: false,
      countColor: "text-yellow-600",
    },
    {
      label: "Approved",
      count: statusCounts.approved,
      isPrimary: false,
      countColor: "text-green-600",
    },
    {
      label: "Rejected",
      count: statusCounts.rejected,
      isPrimary: false,
      countColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statusItems.map((item, index) => (
        <StatusCard key={index} {...item} />
      ))}
    </div>
  );
};

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: TutorStatus }) => {
  const statusConfig: StatusConfigMap = {
    pending: {
      colorClasses: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: "🕒",
      label: "Pending",
    },
    approved: {
      colorClasses: "bg-green-100 text-green-800 border-green-300",
      icon: "✅",
      label: "Approved",
    },
    rejected: {
      colorClasses: "bg-red-100 text-red-800 border-red-300",
      icon: "❌",
      label: "Rejected",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border ${config.colorClasses}`}
    >
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </span>
  );
};

// --- Boolean Status Badge Component ---
const BooleanStatusBadge = ({
  status,
  type,
}: {
  status: boolean;
  type: "verified" | "genius" | "premium";
}) => {
  const statusConfig = {
    verified: {
      true: {
        colorClasses: "bg-green-100 text-green-800 border-green-300",
        icon: Check,
        label: "Verified",
      },
      false: {
        colorClasses: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Check,
        label: "Not Verified",
      },
    },
    genius: {
      true: {
        colorClasses: "bg-blue-200 text-blue-800 border-blue-300",
        icon: Star,
        label: "Genius",
      },
      false: {
        colorClasses: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Star,
        label: "Not Genius",
      },
    },
    premium: {
      true: {
        colorClasses: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Crown,
        label: "Premium",
      },
      false: {
        colorClasses: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Crown,
        label: "Not Premium",
      },
    },
  };

  const config = statusConfig[type][status ? "true" : "false"];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border ${config.colorClasses}`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {config.label}
    </span>
  );
};

// --- Info Row Component for Modal ---
const InfoRow = ({ 
  icon: Icon, 
  label, 
  value, 
  className = "" 
}: { 
  icon: any; 
  label: string; 
  value: string | undefined; 
  className?: string;
}) => (
  <div className={`flex items-start space-x-3 py-3 ${className}`}>
    <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-0.5">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-gray-900 font-medium">{value || "N/A"}</p>
    </div>
  </div>
);

// --- Boolean Status Toggle Component ---
const BooleanStatusToggle = ({
  currentStatus,
  newStatus,
  type,
  onStatusChange,
}: {
  currentStatus: boolean;
  newStatus: boolean;
  type: "verified" | "genius" | "premium";
  onStatusChange: (type: "verified" | "genius" | "premium", value: boolean) => void;
}) => {
  const config = {
    verified: {
      label: "Verified",
      trueLabel: "Verified",
      falseLabel: "Not Verified",
      icon: Check,
      trueColor: "text-green-600",
      falseColor: "text-gray-400",
    },
    genius: {
      label: "Genius",
      trueLabel: "Genius",
      falseLabel: "Not Genius",
      icon: Star,
      trueColor: "text-purple-600",
      falseColor: "text-gray-400",
    },
    premium: {
      label: "Premium",
      trueLabel: "Premium",
      falseLabel: "Not Premium",
      icon: Crown,
      trueColor: "text-yellow-600",
      falseColor: "text-gray-400",
    },
  };

  const {
    label,
    trueLabel,
    falseLabel,
    icon: Icon,
    trueColor,
    falseColor,
  } = config[type];
  const hasChanged = currentStatus !== newStatus;

  return (
    <div
      className={`p-4 bg-white border rounded-lg transition-all duration-200 ${
        hasChanged ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className={`w-5 h-5 ${newStatus ? trueColor : falseColor}`} />
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{label}</p>
              {hasChanged && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Changed
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`${currentStatus ? trueColor : falseColor}`}>
                Current: {currentStatus ? trueLabel : falseLabel}
              </span>
              {hasChanged && (
                <>
                  <span className="text-gray-400">→</span>
                  <span
                    className={`${
                      newStatus ? trueColor : falseColor
                    } font-semibold`}
                  >
                    {newStatus ? trueLabel : falseLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onStatusChange(type, !newStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            newStatus ? "bg-green-500" : "bg-gray-300"
          }`}
          aria-label={`Toggle ${label}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              newStatus ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

// --- Tutor Details Modal Component ---
interface TutorDetailsModalProps {
  tutor: Tutor | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (tutorId: string, statusData: any) => Promise<void>;
}

const TutorDetailsModal: React.FC<TutorDetailsModalProps> = ({ 
  tutor, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TutorStatus>("pending");
  const [booleanStatuses, setBooleanStatuses] = useState({
    verified: false,
    genius: false,
    premium: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (tutor) {
      setSelectedStatus(tutor.tutorStatus || "pending");
      setBooleanStatuses({
        verified: tutor.verified || false,
        genius: tutor.genius || false,
        premium: tutor.premium || false,
      });
    }
  }, [tutor]);

  if (!isOpen || !tutor) return null;

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      await onStatusUpdate(tutor.id, {
        tutorStatus: selectedStatus,
        verified: booleanStatuses.verified,
        genius: booleanStatuses.genius,
        premium: booleanStatuses.genius,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBooleanStatusChange = (
    type: "verified" | "genius" | "premium",
    value: boolean
  ) => {
    setBooleanStatuses((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const statusOptions = [
    { value: "pending" as const, label: "Pending", color: "text-yellow-600" },
    { value: "approved" as const, label: "Approved", color: "text-green-600" },
    { value: "rejected" as const, label: "Rejected", color: "text-red-600" },
  ];

  const hasChanges =
    selectedStatus !== tutor.tutorStatus ||
    booleanStatuses.verified !== tutor.verified ||
    booleanStatuses.genius !== tutor.genius ||
    booleanStatuses.premium !== tutor.premium;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl  max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r bg-green-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{tutor.fullName}</h2>
              <p className="text-blue-100 opacity-90">
                Tutor ID: {tutor.tutor_id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold transition-colors duration-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8">
            {/* Current Status */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Current Status
                  </h3>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={tutor.tutorStatus} />
                    {selectedStatus !== tutor.tutorStatus && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">→</span>
                        <StatusBadge status={selectedStatus} />
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Changed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Registered on</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(tutor.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Personal Information
                </h3>

                <div className="space-y-1">
                  <InfoRow icon={Mail} label="Email" value={tutor.email} />
                  <InfoRow icon={Phone} label="Phone" value={tutor.phone} />
                  <InfoRow icon={User} label="Gender" value={tutor.gender} />
                  <InfoRow
                    icon={Globe}
                    label="Nationality"
                    value={tutor.nationality}
                  />
                  <InfoRow
                    icon={BookOpen}
                    label="Religion"
                    value={tutor.religion}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3 text-green-600" />
                  Academic Information
                </h3>

                <div className="space-y-1">
                  <InfoRow
                    icon={School}
                    label="Institute"
                    value={tutor.Institute_name}
                  />
                  <InfoRow
                    icon={BookOpen}
                    label="Department"
                    value={tutor.department_name}
                  />
                  <InfoRow icon={Calendar} label="Year" value={tutor.year} />
                  <InfoRow
                    icon={MapPin}
                    label="District"
                    value={tutor.district}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Background"
                    value={tutor.background?.join(", ")}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(tutor.alternative_number ||
              tutor.qualification ||
              tutor.experience) && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutor.alternative_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Alternative Number
                      </p>
                      <p className="text-gray-900 font-medium">
                        {tutor.alternative_number}
                      </p>
                    </div>
                  )}
                  {tutor.qualification && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Qualification
                      </p>
                      <p className="text-gray-900 font-medium">
                        {tutor.qualification}
                      </p>
                    </div>
                  )}
                  {tutor.experience && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Experience
                      </p>
                      <p className="text-gray-900 font-medium">
                        {tutor.experience}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Update Section */}
            <div className="mt-8 space-y-6">
              {/* Boolean Status Toggles */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Account Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BooleanStatusToggle
                    currentStatus={tutor.verified || false}
                    newStatus={booleanStatuses.verified}
                    type="verified"
                    onStatusChange={handleBooleanStatusChange}
                  />
                  <BooleanStatusToggle
                    currentStatus={tutor.genius || false}
                    newStatus={booleanStatuses.genius}
                    type="genius"
                    onStatusChange={handleBooleanStatusChange}
                  />
                  {/* <BooleanStatusToggle
                    currentStatus={tutor.premium || false}
                    newStatus={booleanStatuses.premium}
                    type="premium"
                    onStatusChange={handleBooleanStatusChange}
                  /> */}
                </div>
              </div>

              {/* Tutor Status Update */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Update Tutor Status
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as TutorStatus)}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm font-medium"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="text-sm text-gray-600">
                      Current:{" "}
                      <span
                        className={`font-semibold ${
                          statusOptions.find(
                            (opt) => opt.value === tutor.tutorStatus
                          )?.color
                        }`}
                      >
                        {
                          statusOptions.find(
                            (opt) => opt.value === tutor.tutorStatus
                          )?.label
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      disabled={isUpdating}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!hasChanges || isUpdating}
                      className={`px-8 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                        !hasChanges || isUpdating
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      }`}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Application Table Component ---
interface ApplicationTableProps {
  tutors: Tutor[];
  searchTerm: string;
  districtFilter: string;
  onViewDetails: (tutor: Tutor) => void;
  onSearchChange: (value: string) => void;
  onDistrictFilterChange: (value: string) => void;
  paginationProps: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({
  tutors,
  searchTerm,
  districtFilter,
  onViewDetails,
  onSearchChange,
  onDistrictFilterChange,
  paginationProps,
}) => {
  const headers = [
    "Tutor Info",
    "Institute & Department",
    "District",
    "Status",
    "Account Status",
    "Registration Date",
    "Action",
  ];

  const filteredTutors = useMemo(() => {
    return tutors?.filter((tutor) => {
      const matchesSearch =
        searchTerm === "" ||
        tutor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.tutor_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDistrict =
        districtFilter === "" ||
        (tutor.district &&
          tutor.district.toLowerCase().includes(districtFilter.toLowerCase()));

      return matchesSearch && matchesDistrict;
    }) || [];
  }, [tutors, searchTerm, districtFilter]);

  // Apply pagination to filtered data
  const startIndex = (paginationProps.currentPage - 1) * paginationProps.pageSize;
  const endIndex = startIndex + paginationProps.pageSize;
  const paginatedTutors = filteredTutors.slice(startIndex, endIndex);

  // Update total items based on filtered data
  const actualTotalItems = filteredTutors.length;
  const actualTotalPages = Math.max(1, Math.ceil(actualTotalItems / paginationProps.pageSize));

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Search tutors"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
            <input
              type="text"
              placeholder="Filter by district..."
              value={districtFilter}
              onChange={(e) => onDistrictFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Filter by district"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider
                      ${header === "Action" ? "w-20 text-center" : ""} 
                      ${header === "Registration Date" ? "w-32" : ""}
                      ${header === "Account Status" ? "w-48" : ""}
                    `}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedTutors.map((tutor) => (
                <tr
                  key={tutor.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Tutor Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {tutor.fullName}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        ID: {tutor.tutor_id}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {tutor.email}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {tutor.phone}
                      </p>
                    </div>
                  </td>

                  {/* Institute & Department */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {tutor.Institute_name || "N/A"}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {tutor.department_name}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Year: {tutor.year}
                      </p>
                    </div>
                  </td>

                  {/* District */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {tutor.district ? (
                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200">
                          {tutor.district}
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
                          N/A
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tutor.tutorStatus} />
                  </td>

                  {/* Account Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <BooleanStatusBadge
                        status={tutor.verified || false}
                        type="verified"
                      />
                      <BooleanStatusBadge
                        status={tutor.genius || false}
                        type="genius"
                      />
                      {/* <BooleanStatusBadge
                        status={tutor.premium || false}
                        type="premium"
                      /> */}
                    </div>
                  </td>

                  {/* Registration Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(tutor.createdAt).toLocaleDateString()}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onViewDetails(tutor)}
                      title="View Details"
                      className="inline-flex items-center justify-center w-10 h-10 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                      aria-label={`View details for ${tutor.fullName}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedTutors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No tutors found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredTutors.length > 0 && (
          <Pagination 
            {...paginationProps} 
            totalItems={actualTotalItems}
            totalPages={actualTotalPages}
          />
        )}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const TutorApplicationDashboard = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when district filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [districtFilter]);

  // Fetch all data (without pagination from API)
  const {
    data: allTutorsData,
    isLoading,
    error,
    refetch,
  } = useGetAllTutorsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });

  const [updateTutorStatus, { isLoading: isUpdating }] = useUpdateTutorStatusMutation();

  const tutors = useMemo(() => allTutorsData?.data || [], [allTutorsData]);

  const handleViewDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTutor(null);
  };

  const handleStatusUpdate = async (tutorId: string, statusData: any) => {
    try {
      await updateTutorStatus({ id: tutorId, data: statusData }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update tutor status:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDistrictFilterChange = (value: string) => {
    setDistrictFilter(value);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(tutors.length / pageSize)) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading tutors...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg font-medium text-red-600 mb-2">
            Error loading tutors
          </p>
          <p className="text-gray-600 mb-4">
            We couldn't load the tutor data. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare pagination props
  const paginationProps = {
    currentPage,
    totalPages: Math.max(1, Math.ceil(tutors.length / pageSize)),
    totalItems: tutors.length,
    pageSize,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Dashboard Header */}
      <header className="mb-8">
        <div className="flex items-center text-3xl font-bold text-gray-900 mb-2">
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          Tutor Applications
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-lg">
            Manage and review tutor applications efficiently
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="flex items-center">
              <Loader2 className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Updating...' : 'Ready'}
            </span>
            <span className="text-gray-400">•</span>
            <span>Total: {tutors.length} tutors</span>
          </div>
        </div>
      </header>

      {/* Status Cards */}
      <div className="mb-8">
        <StatusCards tutors={tutors} />
      </div>

      {/* Application Table with Pagination */}
      <ApplicationTable
        tutors={tutors}
        searchTerm={debouncedSearchTerm}
        districtFilter={districtFilter}
        onViewDetails={handleViewDetails}
        onSearchChange={handleSearchChange}
        onDistrictFilterChange={handleDistrictFilterChange}
        paginationProps={paginationProps}
      />

      {/* Tutor Details Modal */}
      <TutorDetailsModal
        tutor={selectedTutor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default TutorApplicationDashboard;