import { API_BASE_URL } from '@/config/api';
import { 
  TutorNote, 
  CreateNoteData, 
  UpdateNoteData, 
  NotesFilter, 
  NotesResponse, 
  NoteResponse, 
  CategoriesResponse 
} from '@/types/notes';

class TutorNotesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all notes with optional filters
  async getNotes(filters: NotesFilter = {}): Promise<NotesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.is_archived !== undefined) {
        params.append('is_archived', filters.is_archived.toString());
      }

      const url = `${API_BASE_URL}/tutor-notes${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  // Get a single note by ID
  async getNote(id: number): Promise<NoteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  }

  // Create a new note
  async createNote(noteData: CreateNoteData): Promise<NoteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  // Update a note
  async updateNote(id: number, noteData: UpdateNoteData): Promise<NoteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  // Delete a note
  async deleteNote(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Get note categories
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes/categories/list`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Archive/Unarchive a note
  async archiveNote(id: number, isArchived: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes/${id}/archive`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ is_archived: isArchived })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error archiving note:', error);
      throw error;
    }
  }

  // Toggle important status
  async toggleImportant(id: number, isImportant: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-notes/${id}/important`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ is_important: isImportant })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling note importance:', error);
      throw error;
    }
  }
}

export const tutorNotesService = new TutorNotesService();
