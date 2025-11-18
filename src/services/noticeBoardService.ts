import { HttpClient } from './httpClient';

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  status: 'active' | 'inactive';
  target_audience: 'all' | 'tutors' | 'students';
  created_at: string;
  updated_at: string;
  created_by_name: string;
  created_by_email: string;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'urgent';
  status?: 'active' | 'inactive';
  target_audience?: 'all' | 'tutors' | 'students';
}

export interface UpdateNoticeRequest {
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'success' | 'urgent';
  status?: 'active' | 'inactive';
  target_audience?: 'all' | 'tutors' | 'students';
}

export interface NoticeFilters {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NoticeResponse {
  success: boolean;
  data: Notice;
  message?: string;
}

export interface NoticeListResponse {
  success: boolean;
  data: Notice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NoticeStats {
  total_notices: number;
  active_notices: number;
  inactive_notices: number;
  info_notices: number;
  warning_notices: number;
  success_notices: number;
  urgent_notices: number;
}

export interface NoticeStatsResponse {
  success: boolean;
  data: NoticeStats;
}

class NoticeBoardService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  /**
   * Get all notices with optional filtering and pagination
   */
  async getNotices(filters: NoticeFilters = {}): Promise<NoticeListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `/notice-board?${queryString}` : '/notice-board';
      
      const response = await this.httpClient.get<NoticeListResponse>(url);
      return response;
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  }

  /**
   * Get public notices (active notices for public display)
   */
  async getPublicNotices(): Promise<NoticeListResponse> {
    try {
      const response = await this.httpClient.get<NoticeListResponse>('/notice-board/public');
      return response;
    } catch (error) {
      console.error('Error fetching public notices:', error);
      throw error;
    }
  }

  /**
   * Get notices for students (active notices targeted to students or all)
   */
  async getStudentNotices(): Promise<NoticeListResponse> {
    try {
      const response = await this.httpClient.get<NoticeListResponse>('/notice-board/student');
      return response;
    } catch (error) {
      console.error('Error fetching student notices:', error);
      throw error;
    }
  }

  /**
   * Get notices for tutors (active notices targeted to tutors or all)
   */
  async getTutorNotices(): Promise<NoticeListResponse> {
    try {
      const response = await this.httpClient.get<NoticeListResponse>('/notice-board/tutor');
      return response;
    } catch (error) {
      console.error('Error fetching tutor notices:', error);
      throw error;
    }
  }

  /**
   * Get a single notice by ID
   */
  async getNoticeById(id: string): Promise<NoticeResponse> {
    try {
      const response = await this.httpClient.get<NoticeResponse>(`/notice-board/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  }

  /**
   * Create a new notice
   */
  async createNotice(noticeData: CreateNoticeRequest): Promise<NoticeResponse> {
    try {
      const response = await this.httpClient.post<NoticeResponse>('/notice-board', noticeData);
      return response;
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  /**
   * Update an existing notice
   */
  async updateNotice(id: string, noticeData: UpdateNoticeRequest): Promise<NoticeResponse> {
    try {
      const response = await this.httpClient.put<NoticeResponse>(`/notice-board/${id}`, noticeData);
      return response;
    } catch (error) {
      console.error('Error updating notice:', error);
      throw error;
    }
  }

  /**
   * Delete a notice
   */
  async deleteNotice(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.httpClient.delete<{ success: boolean; message: string }>(`/notice-board/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }

  /**
   * Get notice statistics
   */
  async getNoticeStats(): Promise<NoticeStatsResponse> {
    try {
      const response = await this.httpClient.get<NoticeStatsResponse>('/notice-board/stats/overview');
      return response;
    } catch (error) {
      console.error('Error fetching notice stats:', error);
      throw error;
    }
  }

  /**
   * Search notices by title or content
   */
  async searchNotices(query: string, filters: Omit<NoticeFilters, 'search'> = {}): Promise<NoticeListResponse> {
    try {
      return await this.getNotices({
        ...filters,
        search: query
      });
    } catch (error) {
      console.error('Error searching notices:', error);
      throw error;
    }
  }

  /**
   * Get notices by type
   */
  async getNoticesByType(type: 'info' | 'warning' | 'success' | 'urgent', filters: Omit<NoticeFilters, 'type'> = {}): Promise<NoticeListResponse> {
    try {
      return await this.getNotices({
        ...filters,
        type
      });
    } catch (error) {
      console.error('Error fetching notices by type:', error);
      throw error;
    }
  }

  /**
   * Get notices by status
   */
  async getNoticesByStatus(status: 'active' | 'inactive', filters: Omit<NoticeFilters, 'status'> = {}): Promise<NoticeListResponse> {
    try {
      return await this.getNotices({
        ...filters,
        status
      });
    } catch (error) {
      console.error('Error fetching notices by status:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const noticeBoardService = new NoticeBoardService();
export default noticeBoardService;
