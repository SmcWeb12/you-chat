import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase"; // Firebase config import
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; // Assuming we have an AuthContext for current user

const ProfileView = () => {
  const { currentUser } = useAuth(); // Get current logged in user
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-view p-4">
      <div className="flex items-center space-x-4">
        <img
          src={profile.photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <div>
          <h2 className="text-xl font-bold">{profile.name || "User"}</h2>
          <p className="text-sm">{profile.email}</p>
          <p className="text-sm">{profile.online ? "Online" : "Offline"}</p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Bio</h3>
        <p>{profile.bio || "No bio available."}</p>
      </div>
    </div>
  );
};

export default ProfileView;
