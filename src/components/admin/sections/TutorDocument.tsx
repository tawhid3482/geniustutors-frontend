"use client";
import { useAuth } from "@/contexts/AuthContext.next";
import { useGetAllDocumentQuery } from "@/redux/features/document/documentApi";
import React, { useState } from "react";
import {
  FileText,
  Image,
  File,
  Download,
  Eye,
  Calendar,
  User,
  Mail,
  Phone,
  Shield,
  FileCheck,
  FileWarning,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertCircle,
  Loader2,
  Copy,
} from "lucide-react";
import { UserData } from "../components/UserManagementSection";

interface Document {
  id: string;
  type: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface TutorData {
  user: any;
  documents: Document[];
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: TutorData[];
}

const TutorDocument: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetAllDocumentQuery(currentUser.id) as {
    data: ApiResponse | undefined;
    isLoading: boolean;
    error: any;
  };

  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Documents...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">
            Failed to load documents. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!apiResponse?.success || !apiResponse?.data?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <FileWarning className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            No Documents Found
          </h2>
          <p className="text-gray-600 mb-6">
            No tutors have uploaded any documents yet.
          </p>
        </div>
      </div>
    );
  }

  const tutors = apiResponse.data;
  const documentTypes = Array.from(
    new Set(tutors.flatMap((tutor) => tutor.documents.map((doc) => doc.type)))
  );

  // Filter and search logic
  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.user.phone.includes(searchTerm) ||
      tutor.user.tutor_id?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedType === "ALL") return true;

    return tutor.documents.some((doc) => doc.type === selectedType);
  });

  const toggleTutorExpansion = (userId: string) => {
    const newExpanded = new Set(expandedTutors);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedTutors(newExpanded);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf"))
      return <FileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes("image"))
      return <Image className="w-6 h-6 text-green-500" />;
    if (fileType.includes("document"))
      return <FileText className="w-6 h-6 text-blue-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = fileName || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const typeDisplayNames: Record<string, string> = {
    SSC_HSC_MARKSHEET: "Academic Marksheet",
    NID_BIRTH_CERTIFICATE: "Identity Proof",
    INSTITUTE_ID: "Institute ID",
    PROFILE_PICTURE: "Profile Picture",
    OTHER: "Other Documents",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Tutor Documents Management
          </h1>
          <p className="text-gray-600">
            Manage and review all tutor documents in one place
          </p>
        </div>

      

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or tutor ID..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-10 pr-4 py-3 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="ALL">All Document Types</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {typeDisplayNames[type] || type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tutors List */}
        <div className="space-y-6">
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.user.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Tutor Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleTutorExpansion(tutor.user.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-red-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      {tutor.user.id === currentUser?.id && (
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          You
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {tutor.user.fullName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {tutor.user.email}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(tutor.user.email);
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {tutor.user.phone}
                        </span>
                        {tutor.user.tutor_id && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            ID: {tutor.user.tutor_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {tutor.documents.length}
                      </div>
                      <div className="text-sm text-gray-500">Documents</div>
                    </div>
                    {expandedTutors.has(tutor.user.id) ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Grid (Collapsible) */}
              {expandedTutors.has(tutor.user.id) && (
                <div className="border-t border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutor.documents
                      .filter(
                        (doc) =>
                          selectedType === "ALL" || doc.type === selectedType
                      )
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              {getFileIcon(doc.file_type)}
                              <div className="ml-3">
                                <h4 className="font-semibold text-gray-900">
                                  {typeDisplayNames[doc.type] || doc.type}
                                </h4>
                                <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {doc.file_type.split("/")[1]?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {doc.type.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span>{formatDate(doc.uploaded_at)}</span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  window.open(doc.file_url, "_blank")
                                }
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View File
                              </button>

                              <button
                                onClick={() =>
                                  handleDownload(
                                    doc.file_url,
                                    `${doc.type}_${doc.id}`
                                  )
                                }
                                className="flex-1 py-2.5 border border-green-600 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </button>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 truncate mr-2">
                                  {doc.file_url.split("/").pop()}
                                </span>
                                <button
                                  onClick={() => handleCopy(doc.file_url)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Copy URL"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {tutor.documents.length === 0 && (
                    <div className="text-center py-12">
                      <FileWarning className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No documents found for this tutor
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTutors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Tutors Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No tutors match your search criteria. Try adjusting your filters
              or search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDocument;
