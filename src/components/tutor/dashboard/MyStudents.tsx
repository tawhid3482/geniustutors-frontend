import { useAuth } from '@/contexts/AuthContext.next';
import { useGetAllAssignTutorByRoleQuery } from '@/redux/features/AssignTutor/AssignTutorApi';
import React, { useState } from 'react';
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  TrendingUp,
  Award,
  MessageSquare,
  ExternalLink,
  MoreVertical,
  Download,
  Eye,
  MessageCircle,
  BookMarked,
  Target,
  CheckCircle,
  X,
  UserPlus
} from 'lucide-react';

interface StudentData {
  id: string;
  tutorId: string;
  student: {
    fullName: string;
    email: string;
    phone: string;
    avatar: string | null;
    studentId: string | null;
  };
  salary: number;
  createdAt: string;
  updatedAt: string;
}

const MyStudents = () => {
  const { user } = useAuth();
  const { data: response, isLoading, error } = useGetAllAssignTutorByRoleQuery(user?.tutor_id);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<'all' | 'withId' | 'withoutId'>('all');
  
  const studentsData: StudentData[] = response?.data || [];

  // Filter students based on search and filter options
  const filteredStudents = studentsData.filter(student => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        student.student.fullName.toLowerCase().includes(query) ||
        student.student.email.toLowerCase().includes(query) ||
        student.student.phone.includes(query) ||
        (student.student.studentId && student.student.studentId.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    // Apply ID filter
    if (filterOption === 'withId' && !student.student.studentId) return false;
    if (filterOption === 'withoutId' && student.student.studentId) return false;
    
    return true;
  });

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const totalEarnings = filteredStudents.reduce((sum, student) => sum + student.salary, 0);
  const studentsWithId = filteredStudents.filter(s => s.student.studentId).length;
  const avgSalary = totalStudents > 0 ? Math.round(totalEarnings / totalStudents) : 0;
  
  // Get unique students (by email)
  const uniqueStudents = Array.from(new Set(filteredStudents.map(s => s.student.email)))
    .map(email => filteredStudents.find(s => s.student.email === email));

  // Toggle student details
  const toggleStudentDetails = (id: string) => {
    setExpandedStudent(expandedStudent === id ? null : id);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate performance indicator
  const getPerformanceColor = (salary: number) => {
    if (salary > 3000) return 'text-green-600 bg-green-100';
    if (salary > 1000) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your students...</p>
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
              <p className="text-gray-600 mt-2">
                Manage and track all your assigned students in one place
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-300">
                <User className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="font-medium text-gray-900">{user?.fullName || 'Tutor'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{uniqueStudents.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {totalStudents} total connections
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Monthly Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">৳{totalEarnings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Avg: ৳{avgSalary.toLocaleString()}/student
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Registered Students</p>
                  <p className="text-3xl font-bold text-gray-900">{studentsWithId}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {studentsWithId === 0 ? 'No registered students' : 
                 `${Math.round((studentsWithId / uniqueStudents.length) * 100)}% of total`}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Performance</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {avgSalary > 3000 ? 'Excellent' : avgSalary > 1000 ? 'Good' : 'Fair'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on average salary
              </p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Student Directory</h3>
                <p className="text-gray-600 text-sm">Search and filter your students</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, or ID..."
                    className="w-full pl-10 pr-10 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value as any)}
                    className="pl-4 pr-10 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Students</option>
                    <option value="withId">Registered Only</option>
                    <option value="withoutId">Unregistered</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search Stats */}
            {searchQuery && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-800">
                      Found {filteredStudents.length} students matching "{searchQuery}"
                    </p>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Students Grid/List */}
        {uniqueStudents.length > 0 ? (
          <div className="space-y-6">
            {uniqueStudents.map((studentData:any, index) => {
              const student = studentData.student;
              const studentConnections = filteredStudents.filter(s => s.student.email === student.email);
              const totalStudentEarnings = studentConnections.reduce((sum, s) => sum + s.salary, 0);
              const isExpanded = expandedStudent === studentData.id;

              return (
                <div key={studentData.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Student Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.fullName}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {getInitials(student.fullName)}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{studentConnections.length}</span>
                          </div>
                        </div>

                        {/* Student Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{student.fullName}</h3>
                            {student.studentId ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Student ID: {student.studentId}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <UserPlus className="w-3 h-3 mr-1" />
                                Not Registered
                              </span>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 text-sm truncate">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 text-sm">{student.phone}</span>
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(totalStudentEarnings)}`}>
                              <DollarSign className="w-3 h-3 mr-1" />
                              ৳{totalStudentEarnings.toLocaleString()}/month
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <BookMarked className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {studentConnections.length} session{studentConnections.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Since {formatDate(studentConnections[0]?.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStudentDetails(studentData.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span className="font-medium">Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span className="font-medium">View Details</span>
                            </>
                          )}
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Teaching Sessions ({studentConnections.length})
                        </h4>
                        
                        <div className="space-y-4">
                          {studentConnections.map((connection, idx) => (
                            <div key={connection.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">
                                      Session #{idx + 1}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {formatDate(connection.createdAt)}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Target className="w-4 h-4 text-blue-500" />
                                      <span className="font-medium text-gray-900">
                                        Salary: ৳{connection.salary.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-purple-500" />
                                      <span className="text-gray-600 text-sm">
                                        Updated: {formatDate(connection.updatedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(connection.salary)}`}>
                                    {connection.salary > 3000 ? 'Premium' : connection.salary > 1000 ? 'Standard' : 'Basic'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <MessageCircle className="w-4 h-4" />
                            <span>Send Message</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Calendar className="w-4 h-4" />
                            <span>Schedule Session</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="px-4 py-2 text-gray-700 hover:text-gray-900">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">
                            <Eye className="w-4 h-4" />
                            <span>View Full Profile</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery ? 'No students found' : 'No students assigned yet'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery 
                ? `No students match your search "${searchQuery}". Try a different search term.`
                : 'When students are assigned to you, they will appear here. Contact admin if you believe this is an error.'
              }
            </p>
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Clear Search
              </button>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Stats */}
        {uniqueStudents.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{uniqueStudents.length}</div>
                <p className="text-gray-600 text-sm">Unique Students</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{studentsWithId}</div>
                <p className="text-gray-600 text-sm">Registered Students</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">৳{avgSalary.toLocaleString()}</div>
                <p className="text-gray-600 text-sm">Average Salary</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalStudents}</div>
                <p className="text-gray-600 text-sm">Total Sessions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStudents;