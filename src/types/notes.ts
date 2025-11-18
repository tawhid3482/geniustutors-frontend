export interface TutorNote {
  id: number;
  tutor_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_important: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_important?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_important?: boolean;
  is_archived?: boolean;
}

export interface NotesFilter {
  category?: string;
  search?: string;
  is_archived?: boolean;
}

export interface NotesResponse {
  success: boolean;
  data: TutorNote[];
  message?: string;
}

export interface NoteResponse {
  success: boolean;
  data: TutorNote;
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: string[];
}


