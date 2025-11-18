'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Trash2, Eye } from "lucide-react";
import { JobItem } from "@/hooks/useAdminDashboard";

interface JobsControlSectionProps {
  jobs: JobItem[];
  handleApproveJob: (jobId: string) => void;
  handleRejectJob: (jobId: string) => void;
  handleFeatureJob: (jobId: string) => void;
  handleUnfeatureJob: (jobId: string) => void;
  handleDeleteJob: (jobId: string) => void;
}

export function JobsControlSection({
  jobs,
  handleApproveJob,
  handleRejectJob,
  handleFeatureJob,
  handleUnfeatureJob,
  handleDeleteJob
}: JobsControlSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Filter jobs based on status and search query
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.postedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white p-6 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Jobs Control</h2>
        <p className="text-white/90 mt-1">Manage job postings across the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input 
                placeholder="Search by title or poster" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter("pending");
                  setCurrentPage(1);
                }}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter("approved");
                  setCurrentPage(1);
                }}
              >
                Approved
              </Button>
              <Button 
                variant={statusFilter === "featured" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter("featured");
                  setCurrentPage(1);
                }}
              >
                Featured
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Posted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No jobs found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">Posted {job.date}</div>
                      </TableCell>
                      <TableCell>
                        <div>{job.postedBy}</div>
                        <div className="text-sm text-muted-foreground">{job.budget}</div>
                      </TableCell>
                      <TableCell>
                        {job.status === "approved" ? (
                          <Badge className="bg-green-500">Approved</Badge>
                        ) : job.status === "featured" ? (
                          <Badge className="bg-purple-500">Featured</Badge>
                        ) : job.status === "pending" ? (
                          <Badge className="bg-amber-500">Pending</Badge>
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
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          
                          {job.status === "pending" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleApproveJob(job.id)}
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleRejectJob(job.id)}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {job.status === "approved" && (
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
                          
                          {job.status === "featured" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-slate-500 text-slate-600 hover:bg-slate-50"
                              onClick={() => handleUnfeatureJob(job.id)}
                            >
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Unfeature
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
        </CardContent>
      </Card>
    </div>
  );
}