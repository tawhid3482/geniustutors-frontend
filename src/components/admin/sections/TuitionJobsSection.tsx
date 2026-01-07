'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Trash2, Eye, MapPin, BookOpen, DollarSign, Clock, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TuitionJob {
  id: string;
  studentName: string;
  studentClass: string;
  medium: string;
  subject: string;
  district: string;
  area: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  tutoringType: string;
  daysPerWeek: number;
  tutoringTime: string;
  numberOfStudents: number;
  studentGender: string;
  preferredTeacherGender: string;
  status: string;
  createdAt: string;
  extraInformation?: string;
}

export function TuitionJobsSection() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const itemsPerPage = 5;

  // Mock tuition jobs data
  const mockJobs: TuitionJob[] = [
    {
      id: "1",
      studentName: "Rahul Ahmed",
      studentClass: "10",
      medium: "English",
      subject: "Mathematics",
      district: "Dhaka",
      area: "Dhanmondi",
      salaryRangeMin: 8000,
      salaryRangeMax: 12000,
      tutoringType: "Home",
      daysPerWeek: 3,
      tutoringTime: "Evening",
      numberOfStudents: 1,
      studentGender: "Male",
      preferredTeacherGender: "Any",
      status: "open",
      createdAt: "2023-08-15",
      extraInformation: "Looking for an experienced math tutor for board exam preparation."
    },
    {
      id: "2",
      studentName: "Fatima Rahman",
      studentClass: "12",
      medium: "Bangla",
      subject: "Physics",
      district: "Dhaka",
      area: "Gulshan",
      salaryRangeMin: 10000,
      salaryRangeMax: 15000,
      tutoringType: "Online",
      daysPerWeek: 4,
      tutoringTime: "Afternoon",
      numberOfStudents: 1,
      studentGender: "Female",
      preferredTeacherGender: "Female",
      status: "assigned",
      createdAt: "2023-08-10"
    },
    {
      id: "3",
      studentName: "Karim Hossain",
      studentClass: "8",
      medium: "English",
      subject: "English",
      district: "Chittagong",
      area: "Agrabad",
      salaryRangeMin: 6000,
      salaryRangeMax: 9000,
      tutoringType: "Home",
      daysPerWeek: 3,
      tutoringTime: "Morning",
      numberOfStudents: 2,
      studentGender: "Male",
      preferredTeacherGender: "Male",
      status: "open",
      createdAt: "2023-08-12",
      extraInformation: "Need help with English grammar and composition."
    },
    {
      id: "4",
      studentName: "Nusrat Jahan",
      studentClass: "11",
      medium: "English",
      subject: "Chemistry",
      district: "Dhaka",
      area: "Uttara",
      salaryRangeMin: 9000,
      salaryRangeMax: 14000,
      tutoringType: "Home",
      daysPerWeek: 5,
      tutoringTime: "Evening",
      numberOfStudents: 1,
      studentGender: "Female",
      preferredTeacherGender: "Female",
      status: "completed",
      createdAt: "2023-07-25"
    },
    {
      id: "5",
      studentName: "Arif Islam",
      studentClass: "9",
      medium: "Bangla",
      subject: "Biology",
      district: "Dhaka",
      area: "Mirpur",
      salaryRangeMin: 7000,
      salaryRangeMax: 11000,
      tutoringType: "Online",
      daysPerWeek: 2,
      tutoringTime: "Afternoon",
      numberOfStudents: 1,
      studentGender: "Male",
      preferredTeacherGender: "Any",
      status: "open",
      createdAt: "2023-08-14"
    }
  ];

  // Filter jobs based on status, search query, subject, and location
  const filteredJobs = mockJobs.filter(job => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesSearch = 
      job.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || job.subject === selectedSubject;
    const matchesLocation = selectedLocation === "all" || job.district === selectedLocation;
    
    return matchesStatus && matchesSearch && matchesSubject && matchesLocation;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const subjects = Array.from(new Set(mockJobs.map(job => job.subject)));
  const locations = Array.from(new Set(mockJobs.map(job => job.district)));

  const handleViewJob = (jobId: string) => {
  
  };


  

  const handleFeatureJob = (jobId: string) => {
  };

  const handleDeleteJob = (jobId: string) => {
  };

  return (
    <div className="space-y-6 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white p-6 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tuition Jobs</h2>
        <p className="text-white/90 mt-1">Manage tuition job postings across the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tuition Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
              <div className="flex-1">
                <Input 
                  placeholder="Search by student name, subject, or location" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={selectedSubject} 
                  onValueChange={(value) => {
                    setSelectedSubject(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedLocation} 
                  onValueChange={(value) => {
                    setSelectedLocation(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
              </div>
            </div>

            <TabsList className="mb-4">
              <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>All</TabsTrigger>
              <TabsTrigger value="open" onClick={() => setStatusFilter("open")}>Open</TabsTrigger>
              <TabsTrigger value="assigned" onClick={() => setStatusFilter("assigned")}>Assigned</TabsTrigger>
              <TabsTrigger value="completed" onClick={() => setStatusFilter("completed")}>Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {viewMode === "list" ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Details</TableHead>
                        <TableHead>Subject & Location</TableHead>
                        <TableHead>Salary & Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedJobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No tuition jobs found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              <div className="font-medium">{job.studentName}</div>
                              <div className="text-sm text-muted-foreground">Class {job.studentClass} • {job.medium} Medium</div>
                              <div className="text-xs text-muted-foreground">Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm mb-1">
                                <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                                <span>{job.subject}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4 text-red-500" />
                                <span>{job.district}, {job.area}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm mb-1">
                                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                                <span>৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4 text-orange-500" />
                                <span>{job.daysPerWeek} days/week • {job.tutoringTime}</span>
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {job.tutoringType} Tutoring
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {job.status === "open" ? (
                                <Badge className="bg-blue-500">Open</Badge>
                              ) : job.status === "assigned" ? (
                                <Badge className="bg-amber-500">Assigned</Badge>
                              ) : job.status === "completed" ? (
                                <Badge className="bg-green-500">Completed</Badge>
                              ) : (
                                <Badge className="bg-slate-500">{job.status}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-600"
                                  onClick={() => handleViewJob(job.id)}
                                >
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                                </Button>
                                
                                {job.status === "open" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                                    onClick={() => handleFeatureJob(job.id)}
                                  >
                                    <AlertCircle className="mr-1 h-4 w-4" />
                                    Feature
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteJob(job.id)}
                                >
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedJobs.length === 0 ? (
                    <div className="col-span-full text-center py-6 text-muted-foreground">
                      No tuition jobs found matching your criteria.
                    </div>
                  ) : (
                    paginatedJobs.map((job) => (
                      <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">{job.studentName}'s Request</CardTitle>
                            <Badge variant={job.status === "open" ? "default" : "secondary"}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Class {job.studentClass} • {job.medium} Medium
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                              <span>{job.subject}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-2 h-4 w-4 text-red-500" />
                              <span>{job.district}, {job.area}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                              <span>৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-2 h-4 w-4 text-orange-500" />
                              <span>{job.daysPerWeek} days/week • {job.tutoringTime}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="mr-2 h-4 w-4" />
                              <span>{job.numberOfStudents} student(s) • {job.studentGender}</span>
                            </div>
                          </div>
                          
                          {job.extraInformation && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Additional Information:</p>
                              <p className="text-sm text-muted-foreground">{job.extraInformation}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2">
                            <div className="text-xs text-muted-foreground">
                              Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-blue-600 h-8 px-2"
                                onClick={() => handleViewJob(job.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {job.status === "open" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-purple-600 h-8 px-2"
                                  onClick={() => handleFeatureJob(job.id)}
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 h-8 px-2"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button 
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}