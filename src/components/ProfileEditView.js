import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase/firebase"; // Firebase config import
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext"; // Assuming we have an AuthContext for current user

const ProfileEditView = () => {
  const { currentUser } = useAuth(); // Get current logged in user
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState(""); // Profile image URL
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || "");
          setEmail(userData.email || "");
          setBio(userData.bio || "");
          setPhotoURL(userData.photoURL || "");
        }
      };
      fetchUserData();
    }
  }, [currentUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    let updatedPhotoURL = photoURL;
    if (imageFile) {
      const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload Error: ", error);
        },
        async () => {
          updatedPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
        }
      );
    }

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      name: name,
      email: email,
      bio: bio,
      photoURL: updatedPhotoURL,
    });

    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-edit p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center">Edit Profile</h2>

      {/* Profile Image Upload */}
      <div className="mt-4 flex justify-center">
        <img
          src={photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-2"
        />
      </div>

      {/* Name Field */}
      <div className="mt-4">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border px-3 py-2 rounded-md"
        />
      </div>

      {/* Email Field */}
      <div className="mt-4">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full border px-3 py-2 rounded-md"
          disabled
        />
      </div>

      {/* Bio Field */}
      <div className="mt-4">
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 block w-full border px-3 py-2 rounded-md"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="bg-gray-200 w-full h-2">
            <div
              className="bg-green-600 h-2"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center">{uploadProgress}%</p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileEditView;
