// Student Dashboard Types and Interfaces

export interface Tutor {
  id: string;
  name: string;
  subject: string;
  area: string;
  gender: 'Male' | 'Female' | 'Other';
  rating: number; // 0-5
  qualifications: string;
  availability: string[]; // e.g., ['Mon 6-8pm']
  hourlyRate: number;
}

export interface Booking {
  id: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  type: 'One-time' | 'Recurring';
  schedule: string; // simple text for demo
  status: 'Pending' | 'Paid' | 'Completed' | 'Cancelled';
  amount: number;
}

export interface SessionItem {
  id: string;
  tutorName: string;
  subject: string;
  datetime: string;
  status: 'Upcoming' | 'Attended' | 'Missed';
  notesUrl?: string;
  recordingUrl?: string;
}

export interface ReviewItem {
  id: string;
  tutorName: string;
  subject: string;
  rating: number;
  text: string;
  date: string;
}

export interface TicketItem {
  id: string;
  subject: string;
  category: 'No Show' | 'Payment' | 'Platform' | 'Other';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface NewReview {
  tutorName: string;
  subject: string;
  rating: number;
  text: string;
}

export interface NewTicket {
  subject: string;
  category: TicketItem['category'];
  description: string;
}

export interface PayDialogState {
  open: boolean;
  bookingId?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Card' | 'Wallet' | '';
export type ViewMode = 'grid' | 'list';
export type FilterGender = 'Male' | 'Female' | 'Other' | 'any'; 

export interface ChatContact {
  id: string;
  name: string;
  type: string;
  last_message?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  participant?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: string;
    lastSeen?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}

export interface TutorRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  location: string;
  budget: string;
  schedule: string;
  requirements: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorRequestFormData {
  title: string;
  description: string;
  category: string;
  subject: string;
  location: string;
  budget: string;
  schedule: string;
  requirements: string[];
} 