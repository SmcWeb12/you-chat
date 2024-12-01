import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase"; // Correct Firebase path
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom"; // Link for navigation
import { FaPlusCircle, FaUserCircle } from "react-icons/fa";

const StatusPage = () => {
  const [statuses, setStatuses] = useState([]); // For fetching statuses from Firestore
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch statuses from Firestore in real-time
    const statusQuery = query(collection(db, "status"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(statusQuery, (snapshot) => {
      const statusList = snapshot.docs.map((doc) => doc.data());
      setStatuses(statusList);
    });

    return () => unsubscribe();
  }, []);

  // Sample local statuses for other users
  const localStatuses = [
    {
      id: 1,
      name: "John Doe",
      profileImage: "https://via.placeholder.com/50",
      lastUpdated: "10 minutes ago",
    },
    {
      id: 2,
      name: "Jane Smith",
      profileImage: "https://via.placeholder.com/50",
      lastUpdated: "20 minutes ago",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white py-4 px-4 shadow-md flex items-center justify-between">
        <h2 className="text-xl font-bold">Status</h2>
        <FaPlusCircle size={24} className="text-blue-500" />
      </div>

      {/* My Status Section */}
      <div
        className="flex items-center bg-white py-4 px-4 shadow-md mt-2 cursor-pointer"
        onClick={() => navigate("/mystatus")} // Navigate to MyStatusPage
      >
        <div className="relative">
          <FaUserCircle size={50} className="text-gray-400" />
          <FaPlusCircle
            size={20}
            className="absolute bottom-0 right-0 text-green-500 bg-white rounded-full"
          />
        </div>
        <div className="ml-4">
          <h3 className="text-md font-semibold">My Status</h3>
          <p className="text-sm text-gray-500">Tap to view your status</p>
        </div>
      </div>

      {/* Recent Updates Section */}
      <div className="mt-4">
        <h3 className="px-4 py-2 text-gray-500 text-sm font-semibold">Recent Updates</h3>

        {statuses.length === 0 ? (
          <p className="text-center text-gray-500">No recent updates.</p>
        ) : (
          statuses.map((status) => (
            <Link
              to="/statusview"
              state={{ profileImage: status.profileImage, statusVideo: status.statusVideo }}
              key={status.id}
            >
              <div className="flex items-center bg-white py-4 px-4 shadow-sm hover:bg-gray-100 cursor-pointer">
                <div className="relative">
                  <img
                    src={status.profileImage}
                    alt={status.name}
                    className="w-12 h-12 rounded-full border-2 border-green-500"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-semibold">{status.name}</h3>
                  <p className="text-sm text-gray-500">{status.lastUpdated}</p>
                </div>
              </div>
            </Link>
          ))
        )}

        {/* Sample Local Statuses for Demo */}
        {localStatuses.map((status) => (
          <div
            key={status.id}
            className="flex items-center bg-white py-4 px-4 shadow-sm hover:bg-gray-100 cursor-pointer"
          >
            <div className="relative">
              <img
                src={status.profileImage}
                alt={status.name}
                className="w-12 h-12 rounded-full border-2 border-green-500"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-md font-semibold">{status.name}</h3>
              <p className="text-sm text-gray-500">{status.lastUpdated}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusPage;
