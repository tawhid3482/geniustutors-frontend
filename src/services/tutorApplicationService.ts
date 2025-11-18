import { api } from '@/config/api';

export interface TutorApplication {
  id: string;
  tutorId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  message?: string;
  coverLetter?: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'approved' | 'rejected' | 'withdrawn';
  adminNotes?: string;
  contactedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  applicationType: 'tutor_request' | 'job';
  job: {
    id: string;
    title: string;
    subject: string;
    studentClass: string;
    location: string;
    studentName: string;
    hourlyRate: number;
    status: string;
    tutoringType?: string;
    studentGender?: string;
    preferredTeacherGender?: string;
    daysPerWeek?: number;
    tutoringTime?: string;
    numberOfStudents?: number;
    extraInformation?: string;
    adminNote?: string;
    salaryRangeMin?: number;
    salaryRangeMax?: number;
  };
}

export interface TutorApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export interface CreateApplicationData {
  tutorId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  message?: string;
}

export interface UpdateApplicationData {
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  adminNotes?: string;
}

// Create a new tutor application (contact form)
export const createTutorApplication = async (data: CreateApplicationData) => {
  try {
    const response = await api.post('/tutor-applications/contact', data);
    return response;
  } catch (error) {
    console.error('Error creating tutor application:', error);
    throw error;
  }
};

// Get student's own applications
export const getStudentApplications = async () => {
  try {
    const response = await api.get('/tutor-applications/student-applications');
    return response;
  } catch (error) {
    console.error('Error fetching student applications:', error);
    throw error;
  }
};

// Get tutor's own applications
export const getTutorApplications = async () => {
  try {
    const response = await api.get('/tutor-applications/my-applications');
    return response;
  } catch (error) {
    console.error('Error fetching tutor applications:', error);
    throw error;
  }
};

// Get all tutor applications (admin only)
export const getAllTutorApplications = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  tutorId?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tutorId) queryParams.append('tutorId', params.tutorId);

    const response = await api.get(`/tutor-applications?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching tutor applications:', error);
    throw error;
  }
};

// Get application by ID (admin only)
export const getTutorApplicationById = async (id: number) => {
  try {
    const response = await api.get(`/tutor-applications/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching tutor application:', error);
    throw error;
  }
};

// Update application status (admin only)
export const updateTutorApplicationStatus = async (id: number, data: UpdateApplicationData) => {
  try {
    const response = await api.patch(`/tutor-applications-contact/${id}/status`, data);
    return response;
  } catch (error) {
    console.error('Error updating tutor application status:', error);
    throw error;
  }
};

// Delete application (admin only)
export const deleteTutorApplication = async (id: number) => {
  try {
    const response = await api.delete(`/tutor-applications-contact/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting tutor application:', error);
    throw error;
  }
};

// Get tutor's application statistics
export const getTutorApplicationStats = async () => {
  try {
    const response = await api.get('/tutor-applications/my-stats');
    return response;
  } catch (error) {
    console.error('Error fetching tutor application stats:', error);
    throw error;
  }
};

// Get all application statistics (admin only)
export const getAllTutorApplicationStats = async () => {
  try {
    const response = await api.get('/tutor-applications-contact/stats/overview');
    return response;
  } catch (error) {
    console.error('Error fetching tutor application stats:', error);
    throw error;
  }
};

// Update contact application status (admin only)
export const updateContactApplicationStatus = async (id: string, data: UpdateApplicationData) => {
  try {
    const response = await api.patch(`/tutor-applications/${id}/contact-status`, data);
    return response;
  } catch (error: any) {
    console.error('Error updating contact application status:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update application status'
    };
  }
};

// Delete contact application (admin only)
export const deleteContactApplication = async (id: string) => {
  try {
    const response = await api.delete(`/tutor-applications/${id}/contact`);
    return response;
  } catch (error: any) {
    console.error('Error deleting contact application:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete application'
    };
  }
};

// Withdraw tutor application
export const withdrawApplication = async (applicationId: string) => {
  try {
    const response = await api.patch(`/tutor-applications/${applicationId}/withdraw`);
    return response;
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to withdraw application'
    };
  }
};

// Service object for easy import
export const tutorApplicationService = {
  createTutorApplication,
  getStudentApplications,
  getTutorApplications,
  getAllTutorApplications,
  getTutorApplicationById,
  updateTutorApplicationStatus,
  deleteTutorApplication,
  getTutorApplicationStats,
  getAllTutorApplicationStats,
  updateContactApplicationStatus,
  deleteContactApplication,
  withdrawApplication,
};