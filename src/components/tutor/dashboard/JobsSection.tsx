'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Eye } from 'lucide-react';
import { tuitionJobsService, type TuitionJob } from '@/services/tuitionJobsService';
import { useRouter } from 'next/navigation';

const JobsSection = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<TuitionJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<TuitionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (selectedSubject !== 'all') {
        params.subject = selectedSubject;
      }
      
      if (selectedLocation !== 'all') {
        params.district = selectedLocation;
      }
      
      const response = await tuitionJobsService.getAllTuitionJobs(params);
      if (response.success) {
        setJobs(response.data);
        setFilteredJobs(response.data);
      } else {
        console.error('Failed to fetch tuition jobs');
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedSubject, selectedLocation]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(job => 
        job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.studentClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const handleViewDetails = (jobId: string) => {
    router.push(`/tuition-jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
          <p className="text-gray-600">Browse and apply for tutoring opportunities</p>
        </div>
        <Badge variant="secondary">{filteredJobs.length} jobs available</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs by subject, class, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Subjects</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Bangla">Bangla</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Locations</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.subject} Tutor for {job.studentClass} Student
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-medium">{job.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{job.district}, {job.area}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Salary Range</p>
                        <p className="font-medium text-green-600">৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Class</p>
                        <p className="font-medium">{job.studentClass}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Tutoring Type</p>
                        <p className="font-medium">{job.tutoringType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Days Per Week</p>
                        <p className="font-medium">{job.daysPerWeek} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Preferred Gender</p>
                        <p className="font-medium">{job.preferredTeacherGender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Gender</p>
                        <p className="font-medium">{job.studentGender}</p>
                      </div>
                    </div>

                    {job.extraInformation && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Additional Information:</p>
                        <p className="text-gray-900">{job.extraInformation}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{job.numberOfStudents} student{job.numberOfStudents > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{job.tutoringTime}</span>
                    </div>
                  </div>

                  <div className="ml-6">
                    <Button
                      onClick={() => handleViewDetails(job.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tuition jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedSubject !== 'all' || selectedLocation !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'There are currently no tuition jobs available. Check back later!'
              }
            </p>
            {(searchTerm || selectedSubject !== 'all' || selectedLocation !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('all');
                  setSelectedLocation('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsSection;
