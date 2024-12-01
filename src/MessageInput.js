// src/components/MessageInput.js
import React, { useState, useEffect } from 'react';

function MessageInput({ message, setMessage, handleSendMessage, sending, isTyping }) {
  // Handle typing indicator
  useEffect(() => {
    const timeout = setTimeout(() => setIsTyping(false), 1500);
    if (message) {
      setIsTyping(true); // Show typing indicator
    }
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className="chat-input p-4 bg-white flex border-t-2 border-gray-300">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)} 
        className="flex-grow p-3 border rounded-lg shadow-sm"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSendMessage}
        className={`ml-3 ${sending ? 'bg-gray-400' : 'bg-blue-600'} text-white p-3 rounded-lg`}
        disabled={sending} // Disable the button while sending
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
