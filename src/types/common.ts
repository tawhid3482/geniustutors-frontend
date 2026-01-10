
export type IMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ResponseSuccessType = {
  data: any;
  meta?: IMeta;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
};

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};


// types/course.ts
export interface ICourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  duration_hours: number;
  language: string;
  max_students: number;
  original_price: number;
  price: number;
  requirements: string;
  learning_outcomes: string;
  tags: string[];
  thumbnail_url: string;
  video_intro_url: string;
  video_url: string;
  certificate_available: boolean;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ICourseApiResponse {
 data?: ICourse[] | { data: ICourse[] };
  message?: string;
  success?: boolean;
}

// types/common.ts
export interface Conversation {
  id: string;
  members: string[];
  messages: Message[];
  users: User[];
  updatedAt: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
  unseenCount?: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  conversationId: string;
  isSeen: boolean;
  seenAt?: string | null;
  createdAt: string;
  sender: User;
}

export interface User {
  id: string;
  fullName?: string;
  avatar?: string;
  role: string;
  phone?: string;
}
