import { API_BASE_URL } from '@/config/api';

export interface Tutor {
  id: string;
  tutor_id: string;
  full_name: string;
  location: string;
  district?: string;
  area?: string;
  post_office?: string;
  avatar_url: string | null;
  created_at: string;
  gender: string | null;
  bio: string | null;
  education: string | null;
  experience: string | null;
  subjects: string | string[] | null;
  hourly_rate: number | null;
  rating: number;
  total_reviews: number;
  total_views?: number;
  availability?: string | null;
  premium?: string;
  verified?: number | string;
  qualification?: string;
  tutoring_experience?: string;
  university_name?: string;
  department_name?: string;
  expected_salary?: number;
  days_per_week?: number;
  preferred_tutoring_style?: string;
  educational_qualifications?: string;
  other_skills?: string; // Added this field
  preferred_subjects?: string;
  preferred_class?: string;
  preferred_medium?: string;
  preferred_time?: string;
  religion?: string;
  nationality?: string;
  blood_group?: string;
}

export interface TutorResponse {
  success: boolean;
  data: Tutor[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DistrictStats {
  district: string;
  count: number;
}

export interface DistrictStatsResponse {
  success: boolean;
  data: DistrictStats[];
}

class TutorService {
  private baseUrl = `/api/tutors`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('Making request to:', `${this.baseUrl}${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw response from API:', data);
    return data;
  }

  // Get all tutors
  async getAllTutors(params?: {
    subject?: string;
    location?: string;
    district?: string;
    area?: string;
    post_office?: string;
    minRating?: number;
    maxPrice?: number;
    minExperience?: number;
    gender?: string;
    education?: string;
    availability?: string;
    premium?: string;
    verified?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<TutorResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request<TutorResponse>(endpoint);
  }

  // Get tutor by ID
  async getTutorById(id: string): Promise<{ success: boolean; data: Tutor }> {
    return this.request<{ success: boolean; data: Tutor }>(`/${id}`);
  }

  // Get featured tutors (top 3 rated)
  async getFeaturedTutors(): Promise<TutorResponse> {
    return this.request<TutorResponse>('?sortBy=rating&sortOrder=desc&limit=3');
  }

  // Get tutor counts by district
  async getDistrictStats(): Promise<DistrictStatsResponse> {
    return this.request<DistrictStatsResponse>('/stats/districts');
  }
}

const tutorService = new TutorService();
export default tutorService;
