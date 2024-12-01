import React from 'react';
import { IoLogOut } from 'react-icons/io5';

const Navbar = ({ user }) => {
  return (
    <div className="bg-white shadow-md flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <img src={user.profileImage || "https://via.placeholder.com/50"} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        <span className="font-semibold">{user.name}</span>
      </div>
      <button className="text-blue-600">
        <IoLogOut size={20} />
      </button>
    </div>
  );
};

export default Navbar;
