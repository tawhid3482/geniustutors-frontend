import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorDocument {
  document_type: 'id' | 'certificateFront' | 'certificateBack' | 'education';
  file_url: string;
  created_at: string;
  updated_at: string;
  status?: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

class DocumentService {
  /**
   * Upload a document for the tutor profile
   * @param file The file to upload
   * @param documentType The type of document (id, certificate, education)
   * @returns Promise with the upload result
   */
  async uploadTutorDocument(file: File, documentType: 'id' | 'certificateFront' | 'certificateBack' | 'education'): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await fetch(`${API_BASE_URL}/uploads/tutor-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to upload document' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { success: false, error: 'An error occurred while uploading the document' };
    }
  }

  /**
   * Get all documents for the current tutor
   * @returns Promise with the documents
   */
  async getTutorDocuments(): Promise<{ success: boolean; data?: TutorDocument[]; error?: string }> {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_BASE_URL}/uploads/tutor-documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to get documents' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error getting documents:', error);
      return { success: false, error: 'An error occurred while fetching documents' };
    }
  }

  /**
   * Delete a document
   * @param documentType The type of document to delete
   * @returns Promise with the deletion result
   */
  async deleteTutorDocument(documentType: 'id' | 'certificateFront' | 'certificateBack' | 'education'): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_BASE_URL}/uploads/tutor-document/${documentType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete document' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: 'An error occurred while deleting the document' };
    }
  }
}

export const documentService = new DocumentService();