import { api } from '@/config/api';

export interface ApprovalLetter {
  id: string;
  student_id: string;
  tutor_id: string;
  demo_class_id?: string;
  tutor_request_id?: string;
  subject: string;
  student_class?: string;
  district: string;
  area: string;
  tutoring_type: string;
  medium: string;
  schedule: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  student_status?: 'pending' | 'confirmed' | 'rejected';
  student_updated_at?: string;
  student_notes?: string;
  admin_notes?: string;
  letter_content?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  // Additional fields from joins
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  approved_by_name?: string;
}

export interface ApprovalLetterCreateData {
  student_id: string;
  tutor_id: string;
  demo_class_id?: string;
  tutor_request_id?: string;
  subject: string;
  student_class?: string;
  district: string;
  area: string;
  tutoring_type: string;
  medium: string;
  schedule: string;
  duration: number;
  admin_notes?: string;
  letter_content?: string;
}

export interface ApprovalLetterUpdateData {
  status?: string;
  admin_notes?: string;
  letter_content?: string;
  approved_by?: string;
}

export interface StudentStatusUpdateData {
  student_status: 'confirmed' | 'rejected';
  student_notes?: string;
}

class ApprovalLetterService {
  async getAllApprovalLetters(): Promise<{ success: boolean; data: ApprovalLetter[]; message: string }> {
    try {
      const response = await api.get('/approval-letters');
      return {
        success: true,
        data: response.data,
        message: 'Approval letters fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching approval letters:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch approval letters'
      };
    }
  }

  async getApprovalLetterById(id: string): Promise<{ success: boolean; data: ApprovalLetter | null; message: string }> {
    try {
      const response = await api.get(`/approval-letters/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Approval letter fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching approval letter:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch approval letter'
      };
    }
  }

  async createApprovalLetter(data: ApprovalLetterCreateData): Promise<{ success: boolean; data: ApprovalLetter | null; message: string }> {
    try {
      const response = await api.post('/approval-letters', data);
      return {
        success: true,
        data: response.data,
        message: 'Approval letter created successfully'
      };
    } catch (error: any) {
      console.error('Error creating approval letter:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create approval letter'
      };
    }
  }

  async updateApprovalLetter(id: string, updateData: ApprovalLetterUpdateData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/approval-letters/${id}`, updateData);
      return {
        success: true,
        message: 'Approval letter updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating approval letter:', error);
      return {
        success: false,
        message: error.message || 'Failed to update approval letter'
      };
    }
  }

  async deleteApprovalLetter(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/approval-letters/${id}`);
      return {
        success: true,
        message: 'Approval letter deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting approval letter:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete approval letter'
      };
    }
  }

  async getApprovalLettersForStudent(studentId: string): Promise<ApprovalLetter[]> {
    try {
      const response = await api.get(`/approval-letters/student/${studentId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching approval letters for student:', error);
      return [];
    }
  }

  async getApprovalLettersForTutor(tutorId: string): Promise<ApprovalLetter[]> {
    try {
      const response = await api.get(`/approval-letters/tutor/${tutorId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching approval letters for tutor:', error);
      return [];
    }
  }

  async approveLetter(id: string, approvedBy: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/approval-letters/${id}/approve`, { 
        approved_by: approvedBy, 
        admin_notes: notes 
      });
      return {
        success: true,
        message: 'Approval letter approved successfully'
      };
    } catch (error: any) {
      console.error('Error approving letter:', error);
      return {
        success: false,
        message: error.message || 'Failed to approve letter'
      };
    }
  }

  async rejectLetter(id: string, rejectedBy: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/approval-letters/${id}/reject`, { 
        approved_by: rejectedBy, 
        admin_notes: notes 
      });
      return {
        success: true,
        message: 'Approval letter rejected successfully'
      };
    } catch (error: any) {
      console.error('Error rejecting letter:', error);
      return {
        success: false,
        message: error.message || 'Failed to reject letter'
      };
    }
  }

  async updateStudentStatus(id: string, data: StudentStatusUpdateData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/approval-letters/${id}/student-status`, data);
      return {
        success: true,
        message: response.data?.message || 'Student status updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating student status:', error);
      
      // Handle different error structures
      let errorMessage = 'Failed to update student status';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

export const approvalLetterService = new ApprovalLetterService();
