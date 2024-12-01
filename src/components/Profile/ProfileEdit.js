import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase/firebase'; // Import Firebase setup
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, updateProfile } from 'firebase/auth';

const EditProfile = () => {
  const user = auth.currentUser; // Assume user is logged in
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState(''); // New state for "About" section
  const [visibility, setVisibility] = useState('public');
 
  const [uploadedImageURL, setUploadedImageURL] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [wallpaperURL, setWallpaperURL] = useState('');
  const [notifications, setNotifications] = useState([]); // Initialize as an empty array
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name || '');
        setBio(userData.bio || '');
        setAbout(userData.about || ''); // Load the "About" text if available
        setVisibility(userData.visibility || 'public');
        setUploadedImageURL(userData.profileImage || '');
        setWallpaperURL(userData.wallpaper || '');
        // Ensure notifications is set to an array if it doesn't exist or is not an array
        setNotifications(Array.isArray(userData.notifications) ? userData.notifications : []);
      }
    };

    if (user) fetchUserData();

    document.body.className = theme;
  }, [user, theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('You have been logged out!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const imageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      setUploadedImageURL(downloadURL);
      await updateProfile(auth.currentUser, { photoURL: downloadURL });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { profileImage: downloadURL });
      setUploading(false);
      alert('Profile image updated!');
    }
  };

  const handleWallpaperUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const wallpaperRef = ref(storage, `wallpapers/${user.uid}`);
      await uploadBytes(wallpaperRef, file);
      const wallpaperDownloadURL = await getDownloadURL(wallpaperRef);
      setWallpaperURL(wallpaperDownloadURL);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { wallpaper: wallpaperDownloadURL });
      alert('Wallpaper updated!');
    }
  };

  const handleNotificationChange = (e, index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index] = e.target.value;
    setNotifications(updatedNotifications);

    // Update notifications in Firestore
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { notifications: updatedNotifications });
  };

  const saveProfile = async () => {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { name, bio, about, visibility, notifications });
    alert('Profile updated successfully!');
  };

  return (
    <div className={`container mx-auto p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-md`}>
      <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

      {/* Profile Image */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Profile Image:</label>
        <input
          type="file"
          onChange={handleImageUpload}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        {uploadedImageURL && <img src={uploadedImageURL} alt="Profile" className="mt-4 w-32 h-32 object-cover rounded-full" />}
        {uploading && <p>Uploading...</p>}
      </div>

      {/* Name Update */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Bio Update */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Bio:</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          rows="4"
        />
      </div>

      {/* About Section */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">About:</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          rows="4"
        />
      </div>

      {/* Notifications */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Notifications:</label>
        {notifications.map((notification, index) => (
          <div key={index} className="mb-2">
            <input
              type="text"
              value={notification}
              onChange={(e) => handleNotificationChange(e, index)}
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        ))}
      </div>

      {/* Profile Visibility */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Profile Visibility:</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Chat Wallpaper */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Chat Wallpaper:</label>
        <input
          type="file"
          onChange={handleWallpaperUpload}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        {wallpaperURL && <img src={wallpaperURL} alt="Wallpaper" className="mt-4 w-full h-48 object-cover rounded-lg" />}
      </div>

      {/* Save Profile Button */}
      <button onClick={saveProfile} className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg">
        Save Changes
      </button>

      {/* Logout Button */}
      <button onClick={handleLogout} className="w-full py-3 mt-4 bg-red-500 text-white font-semibold rounded-lg">
        Logout
      </button>

      {/* Theme Toggle */}
      <button onClick={handleThemeChange} className="w-full py-3 mt-4 bg-purple-500 text-white font-semibold rounded-lg">
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  );
};

export default EditProfile;
