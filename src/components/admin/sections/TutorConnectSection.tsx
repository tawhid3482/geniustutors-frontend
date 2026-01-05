import { useGetAllassignTutorQuery } from "@/redux/features/AssignTutor/AssignTutorApi";
import React, { useState, useMemo } from "react";
import {
  Users,
  GraduationCap,
  Phone,
  Mail,
  Link2,
  User,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowDown,
  MapPin,
  BookOpen,
  CheckCircle,
  Star,
  ExternalLink,
  Filter,
  Search,
  Download,
  MoreVertical,
  X,
} from "lucide-react";

interface Student {
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface Tutor {
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface AssignTutorData {
  id: string;
  tutorId: string;
  student: Student;
  tutor: Tutor;
  salary: number;
  createdAt: string;
  updatedAt: string;
}

const TutorConnectSection = () => {
  const {
    data: assignTutorData,
    isLoading,
    error,
  } = useGetAllassignTutorQuery(undefined);
  const [expandedTutor, setExpandedTutor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterBy, setFilterBy] = useState<
    "tutorId" | "tutorName" | "studentName"
  >("tutorId");

  const assignments: AssignTutorData[] = assignTutorData?.data || [];

  // Filter and group assignments based on search
  const { filteredTutorGroups, searchStats } = useMemo(() => {
    const filteredAssignments = assignments.filter((assignment) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();

      switch (filterBy) {
        case "tutorId":
          return assignment.tutorId.toLowerCase().includes(query);
        case "tutorName":
          return assignment.tutor.fullName.toLowerCase().includes(query);
        case "studentName":
          return assignment.student.fullName.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    // Group by tutor
    const tutorGroups = filteredAssignments.reduce(
      (acc, assignment) => {
        const tutorId = assignment.tutorId;
        if (!acc[tutorId]) {
          acc[tutorId] = {
            tutor: assignment.tutor,
            tutorId: tutorId,
            assignments: [],
            totalSalary: 0,
            studentCount: 0,
          };
        }
        acc[tutorId].assignments.push(assignment);
        acc[tutorId].totalSalary += assignment.salary;
        acc[tutorId].studentCount++;
        return acc;
      },
      {} as Record<
        string,
        {
          tutor: Tutor;
          tutorId: string;
          assignments: AssignTutorData[];
          totalSalary: number;
          studentCount: number;
        }
      >
    );

    const stats = {
      totalTutors: Object.keys(tutorGroups).length,
      totalConnections: filteredAssignments.length,
      totalRevenue: filteredAssignments.reduce((sum, a) => sum + a.salary, 0),
      originalTotalTutors: assignments.reduce((unique, a) => {
        if (!unique.includes(a.tutorId)) unique.push(a.tutorId);
        return unique;
      }, [] as string[]).length,
    };

    return { filteredTutorGroups: tutorGroups, searchStats: stats };
  }, [assignments, searchQuery, filterBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutor connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading data
        </h3>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  const toggleExpand = (tutorId: string) => {
    setExpandedTutor(expandedTutor === tutorId ? null : tutorId);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tutor Connections
              </h1>
              <p className="text-gray-600 mt-2">
                Tutors with their connected students
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Container */}
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                {/* Search Type Selector */}
                <div className="relative">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="pl-4 pr-10 py-2 border-2 border-green-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="tutorId">Tutor ID</option>
                    <option value="tutorName">Tutor Name</option>
                    <option value="studentName">Student Name</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Search Input */}
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search by ${
                      filterBy === "tutorId"
                        ? "Tutor ID"
                        : filterBy === "tutorName"
                        ? "Tutor Name"
                        : "Student Name"
                    }...`}
                    className="w-full pl-10 pr-10 py-2 border-2 border-green-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              
            </div>
          </div>

          {/* Search Stats */}
          {searchQuery && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Showing {searchStats.totalTutors} of{" "}
                      {searchStats.originalTotalTutors} tutors
                      {filterBy === "tutorId"
                        ? ` with ID containing "${searchQuery}"`
                        : filterBy === "tutorName"
                        ? ` with name containing "${searchQuery}"`
                        : ` with student name containing "${searchQuery}"`}
                    </p>
                    <p className="text-blue-600 text-sm">
                      {searchStats.totalConnections} connections • ৳
                      {searchStats.totalRevenue.toLocaleString()} total revenue
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear search
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Tutors</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {searchStats.totalTutors}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              {searchQuery &&
                searchStats.totalTutors < searchStats.originalTotalTutors && (
                  <p className="text-sm text-gray-500 mt-2">
                    Filtered from {searchStats.originalTotalTutors} total tutors
                  </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Connections</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {searchStats.totalConnections}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Link2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  {Math.round(
                    (searchStats.totalConnections / assignments.length) * 100
                  )}
                  % of all connections
                </p>
              )}
            </div>

           
          </div>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(filteredTutorGroups).map(([tutorId, group]) => (
            <div
              key={tutorId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Tutor Card Header with Highlight */}
              <div
                className={`p-6 cursor-pointer transition-all ${
                  expandedTutor === tutorId ? "bg-blue-50" : ""
                } ${
                  searchQuery &&
                  tutorId.toLowerCase().includes(searchQuery.toLowerCase())
                    ? "border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => toggleExpand(tutorId)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {group.tutor.fullName.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {group.studentCount}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {group.tutor.fullName}
                        </h3>
                        {searchQuery &&
                          group.tutor.fullName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Name Match
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-sm">
                          ID: {tutorId}
                        </span>
                        {searchQuery &&
                          tutorId
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              ID Match
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <DollarSign className="w-3 h-3 mr-1" />৳
                          {group.totalSalary.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    {expandedTutor === tutorId ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Tutor Info Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 text-sm">
                      {group.tutor.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 text-sm truncate">
                      {group.tutor.email}
                    </span>
                  </div>
                </div>

                {/* Connection Summary */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Students</p>
                    <p className="font-bold text-gray-900">
                      {group.studentCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Avg Salary</p>
                    <p className="font-bold text-gray-900">
                      ৳
                      {(
                        group.totalSalary / group.studentCount
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Status</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 text-sm font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow and Students Section */}
              {expandedTutor === tutorId && (
                <div className="border-t border-gray-200">
                  {/* Arrow Section */}
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="relative h-12">
                      {/* Connection Line */}
                      <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gradient-to-r from-blue-400 via-blue-300 to-green-400"></div>

                      {/* Arrow from Tutor to Students */}
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <div className="relative">
                          <ArrowRight className="w-8 h-8 text-blue-600" />
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-blue-600">
                            Teaches
                          </div>
                        </div>
                      </div>

                      {/* Arrow from Students to Tutor */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-180">
                        <div className="relative">
                          <ArrowRight className="w-8 h-8 text-green-600" />
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-green-600">
                            Connected
                          </div>
                        </div>
                      </div>

                      {/* Middle Connection Point */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Link2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connected Students Section */}
                  <div className="p-6 bg-gray-50">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Connected Students ({group.studentCount})
                    </h4>

                    <div className="space-y-4">
                      {group.assignments
                        .filter((assignment) => {
                          if (!searchQuery || filterBy !== "studentName")
                            return true;
                          return assignment.student.fullName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        })
                        .map((assignment, index) => (
                          <div key={assignment.id} className="relative">
                            {/* Student Card */}
                            <div
                              className={`bg-white rounded-lg p-4 border border-gray-200 shadow-xs hover:border-green-300 transition-colors ${
                                searchQuery &&
                                filterBy === "studentName" &&
                                assignment.student.fullName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                                  ? "border-2 border-yellow-400 bg-yellow-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                      {assignment.student.fullName.charAt(0)}
                                    </div>
                                    <div className="absolute -top-1 -right-1 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                      {index + 1}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-900">
                                        {assignment.student.fullName}
                                      </p>
                                      {searchQuery &&
                                        filterBy === "studentName" &&
                                        assignment.student.fullName
                                          .toLowerCase()
                                          .includes(
                                            searchQuery.toLowerCase()
                                          ) && (
                                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                            Student Match
                                          </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Phone className="w-3 h-3 text-gray-400" />
                                      <span className="text-gray-600 text-sm">
                                        {assignment.student.phone}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                      <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900">
                                        ৳{assignment.salary.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        per month
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Connection Details */}
                              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700 text-sm truncate">
                                    {assignment.student.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600 text-sm">
                                    {new Date(
                                      assignment.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Mini Arrow pointing from Student */}
                              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                                <ArrowRight className="w-5 h-5 text-blue-400 rotate-180" />
                              </div>
                            </div>

                            {/* Vertical Connection Line for multiple students */}
                            {index < group.assignments.length - 1 && (
                              <div className="absolute left-6 top-full h-4 border-l-2 border-dashed border-gray-300"></div>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Search Results Info */}
                    {searchQuery &&
                      filterBy === "studentName" &&
                      group.assignments.some((a) =>
                        a.student.fullName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      ) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Showing{" "}
                            {
                              group.assignments.filter((a) =>
                                a.student.fullName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              ).length
                            }{" "}
                            of {group.studentCount} students matching "
                            {searchQuery}"
                          </p>
                        </div>
                      )}

                    {/* Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Tutor</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            Connection
                          </span>
                          <ArrowRight className="w-4 h-4 text-green-500 rotate-180" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Student</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {searchStats.totalTutors === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No matching tutors found" : "No tutors found"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No tutors found matching "${searchQuery}" by ${
                    filterBy === "tutorId"
                      ? "Tutor ID"
                      : filterBy === "tutorName"
                      ? "Tutor Name"
                      : "Student Name"
                  }.`
                : "When tutors are assigned to students, they will appear here with their connections."}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4">
            Connection Diagram Legend
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                T
              </div>
              <div>
                <p className="font-medium text-gray-900">Tutor</p>
                <p className="text-sm text-gray-600">
                  Blue circle represents tutor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-blue-600" />
                <ArrowRight className="w-8 h-8 text-green-600 rotate-180" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Bi-directional Connection
                </p>
                <p className="text-sm text-gray-600">
                  Blue arrow: Tutor teaches Student
                </p>
                <p className="text-sm text-gray-600">
                  Green arrow: Student connected to Tutor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <p className="font-medium text-gray-900">Student</p>
                <p className="text-sm text-gray-600">
                  Green circle represents student
                </p>
              </div>
            </div>
          </div>

          {/* Search Legend */}
          {searchQuery && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3">
                Search Highlights
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                    ID Match
                  </div>
                  <p className="text-sm text-gray-600">Matching Tutor ID</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">
                    Name Match
                  </div>
                  <p className="text-sm text-gray-600">
                    Matching Tutor/Student Name
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorConnectSection;
