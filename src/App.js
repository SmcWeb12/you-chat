import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase'; // Firebase import for authentication
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ClipLoader } from 'react-spinners'; // Loading spinner component

// Import pages and components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import HomePage from './pages/HomePage';
import ProfileEdit from './components/Profile/ProfileEdit';
import ChatPage from './pages/ChatPage';
import EditProfile from './components/Profile/EditProfile';
import GroupChat from './pages/GroupChat'; // GroupChat page
import GroupChatPage from './pages/GroupChatPage'; // GroupChatPage for specific group chats
import GroupSettingsPage from './pages/GroupSettingsPage'; // GroupSettingsPage
import About from './pages/About'; // About Page for Group
import Navbar from './components/UI/Navbar'; // Navbar for navigation

// Importing StatusPage and MyStatusPage
import StatusPage from './pages/StatusPage'; // Importing StatusPage
import MyStatusPage from './pages/MyStatusPage.js'; // Importing MyStatusPage

// Import the missing StatusViewPage
import StatusViewPage from './pages/StatusViewPage';  // Make sure this import is correct
import Desktop from './pages/Desktop.js';
import SettingsPage from './pages/settings'; // Settings Page import
import ProfileView from './pages/ProfileView.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state to capture errors during authentication

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false); // Set loading to false after authentication state is checked
    }, (error) => {
      setError(error.message); // Capture any error during auth state change
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout function with error handling
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error logging out! Please try again.');
    }
  };

  // Show loading spinner or error message during loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  }

  // Show error message if there's an authentication error
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-red-500">{`Error: ${error}`}</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      

      <Routes>
        {/* Redirect to home if logged in or login page if not */}
        <Route path="/" element={<Navigate to={user ? '/home' : '/login'} />} />

        {/* Authentication Routes */}
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/home" /> : <Signup />} />
        <Route path='/desktop' element={<Desktop />} />

        {/* HomePage and other routes only accessible if user is logged in */}
        <Route path="/home" element={user ? <HomePage user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile/edit" element={user ? <ProfileEdit /> : <Navigate to="/login" />} />
        <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />

        {/* Status Page Routes */}
        <Route path="/status" element={user ? <StatusPage /> : <Navigate to="/login" />} />
        <Route path="/mystatus" element={user ? <MyStatusPage /> : <Navigate to="/login" />} />

        {/* GroupChat Routes */}
        <Route path="/groupchat" element={user ? <GroupChat user={user} /> : <Navigate to="/login" />} />
        <Route path="/groupchat/:groupId" element={user ? <GroupChatPage user={user} /> : <Navigate to="/login" />} />
        
        <Route path="/group/:groupId/settings" element={user ? <GroupSettingsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/group/:groupId/about" element={user ? <About /> : <Navigate to="/login" />} />
        
        {/* Chat and Settings Pages */}
        <Route path="/chat/:userId" element={user ? <ChatPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <SettingsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/chat/:userid" element={<ChatPage />} />
        <Route path="/profileview/:userid" element={<ProfileView />} />
        {/* Status View Page Route */}
        <Route path="/statusview" element={<StatusViewPage />} />
      </Routes>
    </div>
  );
}

export default App;
