import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify"; // For toast notifications
import ChatsPage from "./ChatsPage"; // Importing ChatsPage
import GroupsPage from "./GroupsPage"; // Importing GroupsPage
import StoriesPage from "./StoriesPage"; // Importing StoriesPage
import StatusPage from "./StatusPage"; // Importing StatusPage
import Navbar from "../components/UI/Navbar";
import { FaCommentDots, FaUsers, FaImage, FaCheckCircle } from "react-icons/fa"; // Importing icons

const HomePage = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("chats"); // For switching between Chats, Groups, Stories, and Status

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
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-green-400 to-blue-500">
      {/* Main Content */}
      <Navbar/>
      <div className="flex-grow w-full overflow-y-auto">
        {selectedTab === "chats" && <ChatsPage users={users} />}
        {selectedTab === "groups" && <GroupsPage groups={groups} />}
        {selectedTab === "stories" && <StoriesPage />}
        {selectedTab === "status" && <StatusPage userId={userId} />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-6 shadow-md">
        <div className="flex justify-between items-center">
          {/* Chats Button */}
          <button
            onClick={() => setSelectedTab("chats")}
            className={`flex flex-col items-center justify-center w-1/4 transition-transform ${
              selectedTab === "chats"
                ? "text-blue-500 scale-110"
                : "text-gray-600 hover:text-blue-400"
            }`}
          >
            <FaCommentDots size={28} />
            <span className="text-sm mt-1">Chats</span>
          </button>

          {/* Groups Button */}
          <button
            onClick={() => setSelectedTab("groups")}
            className={`flex flex-col items-center justify-center w-1/4 transition-transform ${
              selectedTab === "groups"
                ? "text-blue-500 scale-110"
                : "text-gray-600 hover:text-blue-400"
            }`}
          >
            <FaUsers size={28} />
            <span className="text-sm mt-1">Groups</span>
          </button>

          {/* Stories Button */}
          <button
            onClick={() => setSelectedTab("stories")}
            className={`flex flex-col items-center justify-center w-1/4 transition-transform ${
              selectedTab === "stories"
                ? "text-blue-500 scale-110"
                : "text-gray-600 hover:text-blue-400"
            }`}
          >
            <FaImage size={28} />
            <span className="text-sm mt-1">Stories</span>
          </button>

          {/* Status Button */}
          <button
            onClick={() => setSelectedTab("status")}
            className={`flex flex-col items-center justify-center w-1/4 transition-transform ${
              selectedTab === "status"
                ? "text-blue-500 scale-110"
                : "text-gray-600 hover:text-blue-400"
            }`}
          >
            <FaCheckCircle size={28} />
            <span className="text-sm mt-1">Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
