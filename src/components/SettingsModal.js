import React, { useState, useEffect } from 'react';
import { updateDoc, doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { storage, db } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateEmail, updatePassword } from 'firebase/auth'; // Firebase Auth functions
import { auth } from '../firebase/firebase'; // Assuming auth is initialized in firebase/firebase.js

const SettingsModal = ({ user, setSettingsModalOpen, chatBackground, setChatBackground, conversationId }) => {
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [blockStatus, setBlockStatus] = useState(false); // For Block/Unblock functionality

  // Show logged-in user's email and name
  const currentUserEmail = auth.currentUser?.email;
  const currentUserName = auth.currentUser?.displayName || "No Name";

  useEffect(() => {
    // Initialize the email field with current user email
    setNewEmail(currentUserEmail);
  }, [currentUserEmail]);

  // Handle wallpaper upload
  const handleWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWallpaperFile(file);
    }
  };

  // Save wallpaper to Firestore and Storage
  const saveWallpaper = async () => {
    if (!wallpaperFile) return;

    const storageRef = ref(storage, `wallpapers/${wallpaperFile.name}`);
    await uploadBytes(storageRef, wallpaperFile);
    const url = await getDownloadURL(storageRef);
    setChatBackground(url); // Set the wallpaper for the chat page header

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      chatBackground: url,
    });
  };

  // Handle Clear Chat
  const handleClearChat = async () => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const querySnapshot = await getDocs(messagesRef);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  // Update email
  const handleEmailChange = async () => {
    try {
      await updateEmail(auth.currentUser, newEmail);
      alert('Email updated successfully!');
    } catch (error) {
      console.error('Error updating email: ', error);
    }
  };

  // Update password
  const handlePasswordChange = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password: ', error);
    }
  };

  // Block/Unblock user
  const handleBlockUnblock = async () => {
    const userRef = doc(db, 'users', user.uid);
    const blockListRef = doc(userRef, 'blockedUsers');
    const blockedUsersSnapshot = await getDocs(blockListRef);

    // Check if the user is already blocked or not
    if (blockedUsersSnapshot.exists()) {
      const blockedUsers = blockedUsersSnapshot.data().users || [];
      if (blockedUsers.includes(user.uid)) {
        // If already blocked, unblock
        const updatedBlockedUsers = blockedUsers.filter(id => id !== user.uid);
        await updateDoc(blockListRef, {
          users: updatedBlockedUsers,
        });
        setBlockStatus(false);
      } else {
        // If not blocked, block user
        await updateDoc(blockListRef, {
          users: [...blockedUsers, user.uid],
        });
        setBlockStatus(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 transform scale-105 transition-transform duration-300">
        <h2 className="font-bold text-xl mb-4 text-gray-800">Settings</h2>

        {/* Display user email and name */}
        <div className="mb-4">
          <p className="text-gray-700">Email: {currentUserEmail}</p>
          <p className="text-gray-700">Name: {currentUserName}</p>
        </div>

        {/* Email Change */}
        <div className="mb-4">
          <label className="block text-gray-700">New Email:</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter new email"
          />
          <button
            onClick={handleEmailChange}
            className="w-full mt-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Update Email
          </button>
        </div>

        {/* Password Change */}
        <div className="mb-4">
          <label className="block text-gray-700">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter new password"
          />
          <button
            onClick={handlePasswordChange}
            className="w-full mt-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Update Password
          </button>
        </div>

        {/* Wallpaper Upload */}
        <div className="mb-4">
          <input
            type="file"
            onChange={handleWallpaperUpload}
            className="w-full p-2 border rounded-lg"
          />
          {wallpaperFile && (
            <div className="text-gray-600 mt-2">
              Selected Wallpaper: {wallpaperFile.name}
            </div>
          )}
          {chatBackground && (
            <img
              src={chatBackground}
              alt="Wallpaper Preview"
              className="mt-4 w-full h-40 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Block/Unblock User */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleBlockUnblock}
            className={`flex-1 ${blockStatus ? 'bg-red-500' : 'bg-green-500'} text-white py-2 rounded-lg hover:bg-${blockStatus ? 'red-600' : 'green-600'}`}
          >
            {blockStatus ? 'Unblock User' : 'Block User'}
          </button>
        </div>

        {/* Clear Chat */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={saveWallpaper}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            Save Wallpaper
          </button>
          <button
            onClick={handleClearChat}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Clear Chat
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setSettingsModalOpen(false)}
          className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
