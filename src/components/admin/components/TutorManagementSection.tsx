'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, Search, Filter, CheckCircle, XCircle, User, Mail, Phone, MapPin, Star, BookOpen, DollarSign } from 'lucide-react';

interface TutorData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  district?: string;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  tutor_id?: string;
  profile?: {
    bio?: string;
    education?: string;
    experience?: string;
    subjects?: string[];
    hourly_rate?: number;
    rating?: number;
    total_reviews?: number;
  };
}

export function TutorManagementSection() {
  const [tutors, setTutors] = useState<TutorData[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<TutorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState<TutorData | null>(null);
  const [showTutorDetailsModal, setShowTutorDetailsModal] = useState(false);

  // Fetch tutors from database
  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        // const response = await fetch('/api/admin/tutors');
        // const data = await response.json();
        
        // Mock data for now
        const mockTutors: TutorData[] = [
          {
            id: '1',
            full_name: 'Rafiq Ahmed',
            email: 'rafiq@example.com',
            phone: '+880 1712345678',
            avatar_url: 'https://ui-avatars.com/api/?name=Rafiq+Ahmed',
            district: 'Dhaka',
            status: 'active',
            created_at: '2023-01-15T10:30:00Z',
            profile: {
              bio: 'Experienced mathematics tutor with 5 years of teaching experience.',
              education: 'MSc in Mathematics, University of Dhaka',
              experience: '5 years of tutoring experience',
              subjects: ['Mathematics', 'Physics'],
              hourly_rate: 800,
              rating: 4.8,
              total_reviews: 24
            }
          },
          {
            id: '2',
            full_name: 'Sadia Khan',
            email: 'sadia@example.com',
            phone: '+880 1812345678',
            avatar_url: 'https://ui-avatars.com/api/?name=Sadia+Khan',
            district: 'Chittagong',
            status: 'active',
            created_at: '2023-02-20T14:45:00Z',
            profile: {
              bio: 'Passionate English language tutor specializing in conversational English.',
              education: 'BA in English Literature, University of Chittagong',
              experience: '3 years of teaching experience',
              subjects: ['English', 'Bengali'],
              hourly_rate: 700,
              rating: 4.5,
              total_reviews: 18
            }
          },
          {
            id: '3',
            full_name: 'Ahmed Khan',
            email: 'ahmed@example.com',
            phone: '+880 1912345678',
            avatar_url: 'https://ui-avatars.com/api/?name=Ahmed+Khan',
            district: 'Sylhet',
            status: 'pending',
            created_at: '2023-03-10T09:15:00Z',
            profile: {
              bio: 'Chemistry and Biology tutor for secondary and higher secondary students.',
              education: 'BSc in Chemistry, University of Sylhet',
              subjects: ['Chemistry', 'Biology'],
              hourly_rate: 650,
              rating: 0,
              total_reviews: 0
            }
          },
          {
            id: '4',
            full_name: 'Nasrin Akter',
            email: 'nasrin@example.com',
            phone: '+880 1612345678',
            avatar_url: 'https://ui-avatars.com/api/?name=Nasrin+Akter',
            district: 'Rajshahi',
            status: 'suspended',
            created_at: '2023-01-05T11:20:00Z',
            profile: {
              bio: 'Mathematics and Physics tutor for all levels.',
              education: 'BSc in Physics, University of Rajshahi',
              experience: '2 years of tutoring experience',
              subjects: ['Mathematics', 'Physics'],
              hourly_rate: 600,
              rating: 3.9,
              total_reviews: 12
            }
          },
          {
            id: '5',
            full_name: 'Kamal Hossain',
            email: 'kamal@example.com',
            phone: '+880 1512345678',
            avatar_url: 'https://ui-avatars.com/api/?name=Kamal+Hossain',
            district: 'Dhaka',
            status: 'active',
            created_at: '2022-12-10T16:30:00Z',
            profile: {
              bio: 'Computer Science tutor specializing in programming and web development.',
              education: 'BSc in Computer Science, BUET',
              experience: '4 years of teaching experience',
              subjects: ['Computer Science', 'Mathematics'],
              hourly_rate: 900,
              rating: 4.9,
              total_reviews: 32
            }
          }
        ];
        
        setTutors(mockTutors);
        setFilteredTutors(mockTutors);
      } catch (error) {
        console.error('Error fetching tutors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tutors. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Get unique subjects from all tutors
  const allSubjects = tutors.reduce((subjects, tutor) => {
    if (tutor.profile?.subjects) {
      tutor.profile.subjects.forEach(subject => {
        if (!subjects.includes(subject)) {
          subjects.push(subject);
        }
      });
    }
    return subjects;
  }, [] as string[]);

  // Filter tutors based on search term, status, and subject
  useEffect(() => {
    let result = tutors;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tutor => 
        tutor.full_name.toLowerCase().includes(term) || 
        tutor.email.toLowerCase().includes(term) ||
        (tutor.phone && tutor.phone.toLowerCase().includes(term)) ||
        (tutor.district && tutor.district.toLowerCase().includes(term))
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(tutor => tutor.status === statusFilter);
    }
    
    // Filter by subject
    if (subjectFilter !== 'all') {
      result = result.filter(tutor => 
        tutor.profile?.subjects?.includes(subjectFilter)
      );
    }
    
    setFilteredTutors(result);
  }, [tutors, searchTerm, statusFilter, subjectFilter]);

  // Handle tutor status change
  const handleStatusChange = async (tutorId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    try {
      // This would be replaced with an actual API call
      // await fetch(`/api/admin/tutors/${tutorId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Update local state
      const updatedTutors = tutors.map(tutor => 
        tutor.id === tutorId ? { ...tutor, status: newStatus } : tutor
      );
      
      setTutors(updatedTutors);
      
      toast({
        title: 'Success',
        description: `Tutor status updated to ${newStatus}.`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating tutor status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tutor status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };

  // Render rating stars
  const renderRatingStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tutor Management</h2>
          <p className="text-muted-foreground">Manage all tutors in the system</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl font-bold">Tutors</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name, email, phone or district..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {allSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No tutors found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tutor ID</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                            {tutor.avatar_url ? (
                              <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700">
                                {tutor.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span>{tutor.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tutor.tutor_id ? (
                          <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border">{tutor.tutor_id}</span>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tutor.profile?.subjects?.map(subject => (
                            <Badge key={subject} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {subject}
                            </Badge>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tutor.profile?.rating !== undefined ? (
                          renderRatingStars(tutor.profile.rating)
                        ) : (
                          <span className="text-gray-500">No ratings</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tutor.profile?.hourly_rate ? (
                          <span className="font-medium">৳{tutor.profile.hourly_rate}/hr</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{renderStatusBadge(tutor.status)}</TableCell>
                      <TableCell>{tutor.district || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedTutor(tutor);
                              setShowTutorDetailsModal(true);
                            }}>
                              View Details
                            </DropdownMenuItem>
                            {tutor.status !== 'active' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'active')}>
                                Activate
                              </DropdownMenuItem>
                            )}
                            {tutor.status !== 'suspended' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'suspended')}>
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {tutor.status !== 'pending' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'pending')}>
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutor Details Modal */}
      <Dialog open={showTutorDetailsModal} onOpenChange={setShowTutorDetailsModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected tutor.
            </DialogDescription>
          </DialogHeader>
          {selectedTutor && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  {selectedTutor.avatar_url ? (
                    <img src={selectedTutor.avatar_url} alt={selectedTutor.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 text-4xl">
                      {selectedTutor.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedTutor.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStatusBadge(selectedTutor.status)}
                    {selectedTutor.profile?.rating !== undefined && (
                      <div className="flex items-center">
                        {renderRatingStars(selectedTutor.profile.rating)}
                        <span className="ml-1 text-sm text-gray-500">
                          ({selectedTutor.profile.total_reviews || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTutor.tutor_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Tutor ID</p>
                      <p className="font-mono bg-gray-50 px-2 py-1 rounded border">{selectedTutor.tutor_id}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{selectedTutor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{selectedTutor.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p>{selectedTutor.district || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Hourly Rate</p>
                    <p>{selectedTutor.profile?.hourly_rate ? `৳${selectedTutor.profile.hourly_rate}/hr` : 'Not set'}</p>
                  </div>
                </div>
              </div>
              
              {selectedTutor.profile?.subjects && selectedTutor.profile.subjects.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.profile.subjects.map(subject => (
                      <Badge key={subject} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTutor.profile?.education && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    Education
                  </h4>
                  <p>{selectedTutor.profile.education}</p>
                </div>
              )}
              
              {selectedTutor.profile?.experience && (
                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <p>{selectedTutor.profile.experience}</p>
                </div>
              )}
              
              {selectedTutor.profile?.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p>{selectedTutor.profile.bio}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Joined on</p>
                <p>{new Date(selectedTutor.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTutorDetailsModal(false)}>Close</Button>
            {selectedTutor && (
              <>
                {selectedTutor.status === 'active' ? (
                  <Button variant="destructive" onClick={() => {
                    handleStatusChange(selectedTutor.id, 'suspended');
                    setShowTutorDetailsModal(false);
                  }}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Suspend Tutor
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    handleStatusChange(selectedTutor.id, 'active');
                    setShowTutorDetailsModal(false);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate Tutor
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}