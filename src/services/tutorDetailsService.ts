import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorDetails {
  qualification: string;
  expected_salary: string;
  availability_status: string;
  days_per_week: number;
  preferred_tutoring_style: string;
  tutoring_experience: string;
  place_of_learning: string;
  extra_facilities: string;
  preferred_medium: string;
  preferred_class: string;
  preferred_subjects: string;
  preferred_time: string;
  preferred_student_gender: string;
  alternative_phone: string;
  university_name: string;
  department_name: string;
  university_year: string;
  religion: string;
  nationality: string;
  blood_group?: string;
  social_media_links: string;
  preferred_tutoring_category: string;
  present_location: string;
  educational_qualifications: Array<{
    examTitle: string;
    institute: string;
    board: string;
    group: string;
    year: string;
    gpa: string;
  }>;
  other_skills: string[];
}

export interface TutorData {
  user_id: string;
  district?: string;
  location?: string;
  qualification: string;
  expectedSalary: string;
  availabilityStatus: string;
  daysPerWeek: number;
  tutoringStyles: string[];
  experience: string;
  placeOfLearning: string[];
  extraFacilities: string[];
  preferredMedium: string[];
  preferredClasses: string[];
  preferredSubjects: string[];
  preferredTime: string[];
  preferredStudentGender: string;
  bloodGroup?: string;
  alternativePhone?: string;
  universityDetails: {
    name: string;
    department: string;
    year: string;
  };
  religion?: string;
  nationality?: string;
  socialMediaLinks?: Record<string, string>;
  preferredTutoringCategory: string[];
  presentLocation: string;
  educationalQualifications: any[];
}

class TutorDetailsService {
  private baseUrl = `${API_BASE_URL}/tutor-details`;

  private toSnakeCasePayload(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const snake: any = {};
    const mapKey = (key: string): string => {
      const explicit: Record<string, string> = {
        expectedSalary: 'expected_salary',
        availabilityStatus: 'availability_status',
        daysPerWeek: 'days_per_week',
        tutoringStyles: 'preferred_tutoring_style',
        placeOfLearning: 'place_of_learning',
        extraFacilities: 'extra_facilities',
        preferredMedium: 'preferred_medium',
        preferredClasses: 'preferred_class',
        preferredSubjects: 'preferred_subjects',
        preferredTime: 'preferred_time',
        preferredStudentGender: 'preferred_student_gender',
        alternativePhone: 'alternative_phone',
        socialMediaLinks: 'social_media_links',
        preferredTutoringCategory: 'preferred_tutoring_category',
        presentLocation: 'present_location',
        educationalQualifications: 'educational_qualifications',
        otherSkills: 'other_skills',
        bloodGroup: 'blood_group',
      };
      return explicit[key] || key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    };

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (key === 'universityDetails' && value && typeof value === 'object') {
        const uni = value as any;
        if (uni.name !== undefined) snake['university_name'] = uni.name;
        if (uni.department !== undefined) snake['department_name'] = uni.department;
        if (uni.year !== undefined) snake['university_year'] = uni.year;
        continue;
      }

      const newKey = mapKey(key);
      // Normalize array fields for backend SET columns
      if (newKey === 'preferred_tutoring_style') {
        const mapStyle = (s: string) => {
          const t = s.toLowerCase();
          if (t.includes('home')) return 'home';
          if (t.includes('batch')) return 'batch';
          if (t.includes('online')) return 'online';
          return s;
        };
        const arr = Array.isArray(value) ? (value as any[]).map(v => mapStyle(String(v))) : [mapStyle(String(value))];
        snake[newKey] = arr.filter(Boolean).join(',');
        continue;
      }
      if (newKey === 'place_of_learning') {
        const mapPlace = (s: string) => s.toLowerCase().includes('online') ? 'online' : 'home';
        const arr = Array.isArray(value) ? (value as any[]).map(v => mapPlace(String(v))) : [mapPlace(String(value))];
        snake[newKey] = arr.filter(Boolean).join(',');
        continue;
      }
      if (newKey === 'preferred_medium') {
        const mapMedium = (s: string) => {
          const t = s.toLowerCase();
          if (t.includes('both')) return 'both';
          if (t.includes('english')) return 'english';
          return 'bangla';
        };
        const arr = Array.isArray(value) ? (value as any[]).map(v => mapMedium(String(v))) : [mapMedium(String(value))];
        snake[newKey] = arr.filter(Boolean).join(',');
        continue;
      }
      if (newKey === 'preferred_time') {
        const mapTime = (s: string) => {
          const t = s.toLowerCase();
          if (t.includes('morning')) return 'morning';
          if (t.includes('afternoon')) return 'afternoon';
          if (t.includes('evening')) return 'evening';
          if (t.includes('night')) return 'night';
          return 'other';
        };
        const arr = Array.isArray(value) ? (value as any[]).map(v => mapTime(String(v))) : [mapTime(String(value))];
        snake[newKey] = arr.filter(Boolean).join(',');
        continue;
      }

      snake[newKey] = Array.isArray(value) || typeof value !== 'object' ? value : this.toSnakeCasePayload(value);
    }

    return snake;
  }

  private async request<T>(
    endpoint: string = '',
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    console.log('TutorDetailsService - Token:', token ? 'Token found' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    console.log('TutorDetailsService - Making request to:', `${this.baseUrl}${endpoint}`);
    console.log('TutorDetailsService - Request config:', {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? 'Body present' : 'No body'
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TutorDetailsService - Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // Handle validation errors specifically
      if (response.status === 400 && errorData.details) {
        const validationErrors = errorData.details.map((err: any) => `${err.param}: ${err.msg}`).join(', ');
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Submit tutor details
  async submitTutorDetails(tutorData: TutorData): Promise<{ success: boolean; message: string }> {
    console.log('Submitting tutor details:', JSON.stringify(tutorData));
    try {
      const result = await this.request<{ success: boolean; message: string }>('/register', {
        method: 'POST',
        body: JSON.stringify(tutorData),
      });
      console.log('Tutor details submission result:', result);
      return result;
    } catch (error) {
      console.error('Error submitting tutor details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to submit tutor details');
    }
  }

  // Update tutor details using the alternative route
  async updateTutorDetails(tutorData: Partial<TutorData>): Promise<{ success: boolean; message: string }> {
    console.log('Updating tutor details:', JSON.stringify(tutorData));
    try {
      const payload = this.toSnakeCasePayload(tutorData);
      const result = await this.request<{ success: boolean; message: string }>('/update', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      console.log('Tutor details update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating tutor details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update tutor details');
    }
  }

  // Update basic tutor details (without problematic fields)
  async updateBasicTutorDetails(tutorData: Partial<TutorData> & { [key: string]: any }): Promise<{ success: boolean; message: string }> {
    console.log('Updating basic tutor details:', JSON.stringify(tutorData));
    try {
      const payload = this.toSnakeCasePayload(tutorData);
      console.log('Converted payload:', JSON.stringify(payload));
      const result = await this.request<{ success: boolean; message: string }>('/update-basic', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      console.log('Basic tutor details update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating basic tutor details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update basic tutor details');
    }
  }

  // Test token endpoint
  async testToken(): Promise<any> {
    return this.request('/test-token');
  }

  // Get tutor details for the current user
  async getTutorDetails(): Promise<{ success: boolean; data: TutorDetails }> {
    return this.request('/me');
  }
}

const tutorDetailsService = new TutorDetailsService();
export default tutorDetailsService;