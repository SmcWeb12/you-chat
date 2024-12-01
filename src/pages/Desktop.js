import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify"; // For toast notifications
import ChatsPage from "./ChatsPage"; // Importing ChatsPage
import ChatPage from "./ChatPage"; // ChatPage for selected user
import Navbar from "../components/UI/Navbar";

const Desktop = ({ userId, user }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user for the chat
  const [selectedGroup, setSelectedGroup] = useState(null); // Track selected group for the chat

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Groups
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsList = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch Users
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGroups(groupsList);
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <div className="loader h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Left Panel: Chats/Groups */}
        <div className="w-1/3 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Chats</h2>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setSelectedGroup(null); // Deselect group
                }}
                className="cursor-pointer p-2 rounded-md hover:bg-gray-100 flex items-center space-x-3"
              >
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            ))}

            <h2 className="text-lg font-bold mt-6 mb-4">Groups</h2>
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedUser(null); // Deselect user
                }}
                className="cursor-pointer p-2 rounded-md hover:bg-gray-100 flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  G
                </div>
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-500">{group.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Page */}
        <div className="w-2/3 bg-gray-50">
          {/* Display chat page if a user or group is selected */}
          {selectedUser && <ChatPage user={user} userId={selectedUser.id} />}
          {selectedGroup && (
            <div className="p-4">
              <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
              <p>{selectedGroup.description}</p>
              {/* You can add a group chat feature here */}
            </div>
          )}
          {!selectedUser && !selectedGroup && (
            <div className="h-full flex justify-center items-center text-gray-500">
              <p>Select a chat or group to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Desktop;
