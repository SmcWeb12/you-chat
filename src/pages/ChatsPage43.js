// src/pages/ChatPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Link ka use kiya
import { db } from '../firebase/firebase'; // Firebase import here
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import MessageInput from './MessageInput';
import SettingsModal from '../components/SettingsModal';

const ChatPage = ({ user }) => {
  const { userId } = useParams();
  const [receiver, setReceiver] = useState({ name: '', image: '', online: '' });
  const [messages, setMessages] = useState([]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [chatBackground, setChatBackground] = useState('');

  const conversationId = [user.uid, userId].sort().join('_');

  // Fetch receiver details
  useEffect(() => {
    const fetchReceiverDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setReceiver({
            name: userDoc.data().name || 'Unknown User',
            image: userDoc.data().image || '/default-avatar.png',
            online: userDoc.data().online ? 'Online' : 'Offline',
          });
        }
      } catch (error) {
        console.error('Error fetching receiver details:', error);
      }
    };

    fetchReceiverDetails();
  }, [userId]);

  // Fetch real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Fetch wallpaper
  useEffect(() => {
    const fetchWallpaper = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().chatBackground) {
        setChatBackground(userDoc.data().chatBackground);
      }
    };

    fetchWallpaper();
  }, [user.uid]);

  return (
    <div className="chat-page h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <header className="bg-white p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <img
            src={receiver.image}
            alt={receiver.name}
            className="w-10 h-10 rounded-full shadow"
          />
          <div>
            {/* Clickable Name */}
            <Link to={`/user/${userId}`} className="font-semibold text-lg text-gray-800 hover:underline">
              {receiver.name}
            </Link>
            <div className="text-sm text-gray-500">{receiver.online && `• ${receiver.online}`}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Messages Section */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `url(${chatBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg shadow-lg ${
                msg.senderId === user.uid
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p>{msg.text}</p>
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Message"
                  className="mt-2 w-48 h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => window.open(msg.image, '_blank')}
                />
              )}
              {msg.audio && (
                <audio controls className="mt-2">
                  <source src={msg.audio} />
                </audio>
              )}
              {msg.file && (
                <a
                  href={msg.file}
                  className="mt-2 text-sm text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white shadow-md">
        <MessageInput
          user={user}
          userId={userId}
          conversationId={conversationId}
        />
      </div>

      {/* Settings Modal */}
      {settingsModalOpen && (
        <SettingsModal
          user={user}
          setSettingsModalOpen={setSettingsModalOpen}
          chatBackground={chatBackground}
          setChatBackground={setChatBackground}
        />
      )}
    </div>
  );
};

export default ChatPage;


