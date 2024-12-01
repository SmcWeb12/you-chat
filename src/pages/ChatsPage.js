import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

// Assuming the server is running on localhost:5000 (update with your server URL)
const socket = io('http://localhost:5000'); 

const ChatApp = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [message, setMessage] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sending messages
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = { text: message, isUser: true };
      setMessages([...messages, newMessage]);
      socket.emit('sendMessage', { text: message, chatId: currentChat.id });
      setMessage('');
      setTyping(false); // Reset typing indicator
    }
  };

  // Handle typing events
  const handleTyping = (e) => {
    setMessage(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  // Listen for incoming messages via WebSocket
  useEffect(() => {
    socket.on('receiveMessage', (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  // Simulate user typing status
  useEffect(() => {
    const interval = setInterval(() => {
      if (typing) {
        socket.emit('userTyping', { chatId: currentChat.id });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [typing, currentChat]);

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Chats</h2>
          <button className="text-gray-500">
            <i className="fas fa-search"></i> {/* Search icon */}
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search chats or contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border-b border-gray-300"
        />

        {/* Chat List */}
        {!currentChat && (
          <div className="overflow-y-auto max-h-screen">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/chat/${user.id}`}
                  onClick={() => setCurrentChat(user)}
                  className="flex items-center p-4 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-12 h-12 mr-4">
                    <img
                      src={user.profileImage || '/path/to/placeholder.jpg'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                  </div>
                  <div className="text-sm text-gray-400">{user.lastSeen}</div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Chat Window */}
        {currentChat && (
          <div className="flex flex-col h-screen">
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b">
              <img
                src={currentChat.profileImage || '/path/to/placeholder.jpg'}
                alt={currentChat.name}
                className="w-10 h-10 rounded-full mr-4"
              />
              <p className="font-medium">{currentChat.name}</p>
            </div>

            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`my-2 ${msg.isUser ? 'text-right' : 'text-left'}`}
                >
                  <p
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-300'
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}

              {/* Typing Indicator */}
              {typing && !message.trim() && (
                <div className="text-gray-500 text-sm">User is typing...</div>
              )}
            </div>

            {/* Message Input Section */}
            <div className="flex items-center mt-2 border-t pt-2">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type a message"
                className="w-full p-2 border rounded-l-full"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-2 rounded-full ml-2"
              >
                <i className="fas fa-paper-plane"></i> {/* Send icon */}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
