import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { db } from '../firebase/firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 

function UserList({ users = [], currentUser }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfiles, setUserProfiles] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]); // To track blocked users
  
  // Fetch user profiles with profile pictures and blocked users
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const usersWithProfilePictures = await Promise.all(
        users.map(async (user) => {
          const userDocRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            return { ...user, profilePicture: userDoc.data().profilePicture || 'https://via.placeholder.com/50' };
          }
          return user;
        })
      );
      setUserProfiles(usersWithProfilePictures);
    };

    const fetchBlockedUsers = async () => {
      const currentUserDocRef = doc(db, 'users', currentUser.id);
      const currentUserDoc = await getDoc(currentUserDocRef);
      if (currentUserDoc.exists()) {
        setBlockedUsers(currentUserDoc.data().blockedUsers || []);
      }
    };

    fetchUserProfiles();
    fetchBlockedUsers();
  }, [users, currentUser.id]);

  // Handle block/unblock action
  const toggleBlock = async (userId) => {
    const currentUserRef = doc(db, 'users', currentUser.id);
    const currentUserDoc = await getDoc(currentUserRef);
    const currentUserData = currentUserDoc.data();
    let updatedBlockedUsers = [...(currentUserData.blockedUsers || [])];

    if (updatedBlockedUsers.includes(userId)) {
      // Unblock the user
      updatedBlockedUsers = updatedBlockedUsers.filter(id => id !== userId);
    } else {
      // Block the user
      updatedBlockedUsers.push(userId);
    }

    await updateDoc(currentUserRef, { blockedUsers: updatedBlockedUsers });
    setBlockedUsers(updatedBlockedUsers); // Update state locally
  };

  // Filter users based on search term
  const filteredUsers = userProfiles.filter((user) =>
    user?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  );

  return (
    <div className="user-list-container bg-white p-4 rounded-lg shadow-lg max-w-[380px] mx-auto h-full overflow-y-auto">
      {/* Search Bar */}
      <div className="search-bar mb-4">
        <input
          type="text"
          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Search or start new chat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users List */}
      <ul className="user-list space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <li
              key={user.id}
              className="user-item flex items-center p-3 bg-white rounded-lg hover:bg-gray-100 cursor-pointer transition duration-200 ease-in-out"
            >
              {/* User Profile Picture */}
              <div className="user-avatar relative mr-4">
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/50'}
                  alt={`${user.name}'s profile`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                {/* Online/Offline Status Indicator */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></span>
              </div>

              {/* User Name */}
              <div className="user-info flex flex-col justify-center">
                <span className="user-name font-semibold text-gray-800 text-sm truncate">
                  {user.name}
                </span>
                <span className="user-last-message text-gray-500 text-xs truncate">
                  {user.lastMessage || 'No messages yet'}
                </span>
              </div>

              {/* Block/Unblock Button */}
              <div className="block-unblock-btn ml-auto">
                {blockedUsers.includes(user.id) ? (
                  <button
                    onClick={() => toggleBlock(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => toggleBlock(user.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded-lg"
                  >
                    Block
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500">No users available</li>
        )}
      </ul>
    </div>
  );
}

export default UserList;
