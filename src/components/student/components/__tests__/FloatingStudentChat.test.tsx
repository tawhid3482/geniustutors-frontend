import React from 'react';
import { render, screen } from '@testing-library/react';
import { FloatingStudentChat } from '../FloatingStudentChat';

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the API_BASE_URL
jest.mock('@/config/api', () => ({
  API_BASE_URL: 'http://localhost:5000/api',
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('FloatingStudentChat', () => {
  const mockProps = {
    chatContacts: [],
    chatMessages: {},
    selectedChat: null,
    setSelectedChat: jest.fn(),
    newMessage: '',
    setNewMessage: jest.fn(),
    handleSendMessage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the floating chat button', () => {
    render(<FloatingStudentChat {...mockProps} />);
    
    // Check if the floating chat button is rendered
    const chatButton = screen.getByRole('button', { name: /message/i });
    expect(chatButton).toBeInTheDocument();
  });

  it('shows chat widget when button is clicked', () => {
    render(<FloatingStudentChat {...mockProps} />);
    
    // Initially, chat widget should not be visible
    expect(screen.queryByText('Support Chat')).not.toBeInTheDocument();
    
    // Click the chat button
    const chatButton = screen.getByRole('button', { name: /message/i });
    chatButton.click();
    
    // Chat widget should now be visible
    expect(screen.getByText('Support Chat')).toBeInTheDocument();
  });

  it('displays empty state when no chats exist', () => {
    render(<FloatingStudentChat {...mockProps} />);
    
    // Open chat widget
    const chatButton = screen.getByRole('button', { name: /message/i });
    chatButton.click();
    
    // Should show empty state
    expect(screen.getByText('No support chats yet')).toBeInTheDocument();
    expect(screen.getByText('Start a new chat with an admin')).toBeInTheDocument();
  });

  it('displays chat contacts when they exist', () => {
    const mockContacts = [
      {
        id: '1',
        name: 'Chat with Admin',
        type: 'direct',
        unread_count: 2,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        admin: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
        },
      },
    ];

    const propsWithContacts = {
      ...mockProps,
      chatContacts: mockContacts,
    };

    render(<FloatingStudentChat {...propsWithContacts} />);
    
    // Open chat widget
    const chatButton = screen.getByRole('button', { name: /message/i });
    chatButton.click();
    
    // Should show the chat contact
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Unread count badge
  });
});
