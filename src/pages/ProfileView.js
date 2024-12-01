import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProfileView = ({ userId, currentUserId, setIsProfileViewVisible }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gradient-to-r from-blue-400 to-green-400 rounded-lg w-4/5 sm:w-1/3 p-6 shadow-lg relative">
        {/* Close button */}
        <button
          onClick={() => setIsProfileViewVisible(false)}  // Close ProfileView
          className="text-red-500 absolute top-2 right-2 p-2"
        >
          X
        </button>
        
        {/* Profile picture with click to enlarge */}
        <div className="flex justify-center items-center mb-4">
          <img
            src={userProfile.profileImage || "https://via.placeholder.com/150"}
            alt={userProfile.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md cursor-pointer transition-transform duration-300 transform hover:scale-110"
          />
        </div>

        {/* Name Box */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4 hover:bg-gray-100 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold text-center text-gray-800">{userProfile.name}</h2>
        </div>

        {/* Email Box */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4 hover:bg-gray-100 transition duration-300 ease-in-out">
          <p className="text-center text-gray-600">{userProfile.email}</p>
        </div>

        {/* Bio Box */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4 hover:bg-gray-100 transition duration-300 ease-in-out">
          <p className="text-center text-gray-500">{userProfile.bio}</p>
        </div>

        {/* Notifications */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <ul className="list-disc pl-4 mt-2 text-white">
            {userProfile.notifications && userProfile.notifications.map((notif, index) => (
              <li key={index}>{notif}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
