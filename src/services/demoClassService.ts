import { api } from '@/config/api';

export interface DemoClass {
  id: string;
  student_id: string;
  tutor_id: string;
  tutor_request_id?: string;
  subject: string;
  requested_date: string;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  student_notes?: string;
  tutor_notes?: string;
  admin_notes?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  request_district?: string;
  request_area?: string;
  student_class?: string;
  tutoring_type?: string;
  medium?: string;
}

export interface DemoClassUpdateData {
  status?: string;
  admin_notes?: string;
  student_notes?: string;
  tutor_notes?: string;
  requested_date?: string;
  duration?: number;
}

class DemoClassService {
  async getAllDemoClasses(): Promise<{ success: boolean; data: DemoClass[]; message: string }> {
    try {
      const response = await api.get('/demo-classes');
      return {
        success: true,
        data: response.data,
        message: 'Demo classes fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching demo classes:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch demo classes'
      };
    }
  }

  async getDemoClassById(id: string): Promise<{ success: boolean; data: DemoClass | null; message: string }> {
    try {
      const response = await api.get(`/demo-classes/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Demo class fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching demo class:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch demo class'
      };
    }
  }

  async updateDemoClass(id: string, updateData: DemoClassUpdateData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/demo-classes/${id}`, updateData);
      return {
        success: true,
        message: 'Demo class updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating demo class:', error);
      return {
        success: false,
        message: error.message || 'Failed to update demo class'
      };
    }
  }

  async deleteDemoClass(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/demo-classes/${id}`);
      return {
        success: true,
        message: 'Demo class deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting demo class:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete demo class'
      };
    }
  }

  async createDemoClass(demoClassData: Partial<DemoClass>): Promise<{ success: boolean; data: DemoClass | null; message: string }> {
    try {
      const response = await api.post('/demo-classes', demoClassData);
      return {
        success: true,
        data: response.data,
        message: 'Demo class created successfully'
      };
    } catch (error: any) {
      console.error('Error creating demo class:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create demo class'
      };
    }
  }

  async getDemoClassesForStudent(studentId: string): Promise<DemoClass[]> {
    try {
      const response = await api.get(`/demo-classes/student/${studentId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching demo classes for student:', error);
      return [];
    }
  }

  async getDemoClasses(tutorId: string): Promise<DemoClass[]> {
    try {
      const response = await api.get(`/demo-classes/tutor/${tutorId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching demo classes for tutor:', error);
      return [];
    }
  }

  async acceptDemoClass(demoClassId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/demo-classes/${demoClassId}/accept`, { tutor_notes: notes });
      return {
        success: true,
        message: 'Demo class accepted successfully'
      };
    } catch (error: any) {
      console.error('Error accepting demo class:', error);
      return {
        success: false,
        message: error.message || 'Failed to accept demo class'
      };
    }
  }

  async rejectDemoClass(demoClassId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/demo-classes/${demoClassId}/reject`, { tutor_notes: notes });
      return {
        success: true,
        message: 'Demo class rejected successfully'
      };
    } catch (error: any) {
      console.error('Error rejecting demo class:', error);
      return {
        success: false,
        message: error.message || 'Failed to reject demo class'
      };
    }
  }

  async completeDemoClass(demoClassId: string, feedback?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/demo-classes/${demoClassId}/complete`, { feedback });
      return {
        success: true,
        message: 'Demo class completed successfully'
      };
    } catch (error: any) {
      console.error('Error completing demo class:', error);
      return {
        success: false,
        message: error.message || 'Failed to complete demo class'
      };
    }
  }
}

export const demoClassService = new DemoClassService(); 