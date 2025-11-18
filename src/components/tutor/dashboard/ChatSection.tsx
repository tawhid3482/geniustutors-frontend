'use client';

import React, { useState } from 'react';
import { EnhancedTutorSupport } from '../EnhancedTutorSupport';

const ChatSection = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  return (
    <EnhancedTutorSupport
      selectedChat={selectedChat}
      setSelectedChat={setSelectedChat}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
    />
  );
};

export default ChatSection;
