// GroupsPage.js
import React from "react";
import { Link } from "react-router-dom";

const GroupsPage = ({ groups }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <Link
          to={`/groupchat/${group.id}`} // Redirect to GroupChatPage.js when clicked
          key={group.id}
        >
          <div className="group-card bg-white p-4 rounded-xl border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            {/* Group Info Section */}
            <div className="flex items-center space-x-3">
              {/* Group Image */}
              <div className="group-image w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-gray-300">
                <img
                  src={group.image || 'https://via.placeholder.com/100'}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Group Name and Info */}
              <div className="group-info flex-grow">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">{group.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{group.members.length} members</p>
              </div>
            </div>

            {/* Last Message and Group Activity */}
            <div className="group-activity mt-2 text-gray-600 flex justify-between items-center">
              <p className="text-xs sm:text-sm line-clamp-1">{group.lastMessage || "No messages yet"}</p>
              {group.isActive && (
                <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>

            {/* Group Type / Admin */}
            <div className="group-type mt-1 text-xs sm:text-sm text-gray-500">
              <p>{group.isAdmin ? "Admin" : "Member"}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default GroupsPage;
