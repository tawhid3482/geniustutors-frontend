import { API_BASE_URL } from '@/config/api';

export interface Session {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_avatar?: string;
  earnings?: number;
}

export interface SessionStats {
  total: number;
  scheduled: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  totalEarnings: number;
  thisMonthEarnings: number;
}

export interface SessionNotes {
  session_id: string;
  notes: string;
  topics_covered: string[];
  homework_assigned: string[];
  next_session_plan: string;
}

class SessionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getSessions(tutorId: string, status?: string): Promise<Session[]> {
    try {
      const url = status 
        ? `${API_BASE_URL}/sessions/tutor/${tutorId}?status=${status}`
        : `${API_BASE_URL}/sessions/tutor/${tutorId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  async getSessionStats(tutorId: string): Promise<SessionStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/tutor/${tutorId}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session stats');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching session stats:', error);
      throw error;
    }
  }

  async startSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/start`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status: 'ongoing' })
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async completeSession(sessionId: string, notes: SessionNotes): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'completed',
          notes: notes.notes,
          topics_covered: notes.topics_covered,
          homework_assigned: notes.homework_assigned,
          next_session_plan: notes.next_session_plan
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }

  async cancelSession(sessionId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/cancel`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  }

  async updateSessionNotes(sessionId: string, notes: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/notes`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update session notes');
      }
    } catch (error) {
      console.error('Error updating session notes:', error);
      throw error;
    }
  }

  async getUpcomingSessions(tutorId: string): Promise<Session[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/tutor/${tutorId}/upcoming`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming sessions');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  }
}

export const sessionService = new SessionService(); 