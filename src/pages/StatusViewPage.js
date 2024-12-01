import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useSwipeable } from "react-swipeable"; // Import swipeable library for gesture support

const StatusViewPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null); // Logged-in user details
  const [statusList, setStatusList] = useState([]); // All statuses
  const [fullScreenStatusIndex, setFullScreenStatusIndex] = useState(null); // Currently viewed status index
  const [isLoading, setIsLoading] = useState(true); // Loading state for media
  const [isMuted, setIsMuted] = useState(true); // Default video sound state

  // Fetch current user data and check login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Unknown User",
        });
      } else {
        navigate("/login"); // If not logged in, redirect to login
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Fetch all statuses from Firestore (without any filtering)
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(collection(db, "status"), (snapshot) => {
        const statuses = snapshot.docs
          .map((doc) => doc.data())  // Convert Firestore docs to data
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds); // Sort statuses by timestamp
        setStatusList(statuses);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Function to handle next status after current status finishes
  const handleStatusEnd = () => {
    if (fullScreenStatusIndex < statusList.length - 1) {
      setFullScreenStatusIndex(fullScreenStatusIndex + 1); // Move to next status
    } else {
      setFullScreenStatusIndex(null); // End the full-screen view when there are no more statuses
    }
  };

  // Handle swipe gestures to move between statuses
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleNextStatus(),  // Swipe up to move to next status
    onSwipedDown: () => handlePreviousStatus(), // Swipe down to move to previous status
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // Function to go to the next status manually (via swipe or tap)
  const handleNextStatus = () => {
    if (fullScreenStatusIndex < statusList.length - 1) {
      setFullScreenStatusIndex(fullScreenStatusIndex + 1); // Move to next status
    }
  };

  // Function to go to the previous status
  const handlePreviousStatus = () => {
    if (fullScreenStatusIndex > 0) {
      setFullScreenStatusIndex(fullScreenStatusIndex - 1); // Move to previous status
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false); // Set loading to false once media is loaded
  };

  const toggleMute = () => {
    setIsMuted(!isMuted); // Toggle the mute state for video
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Status View</h2>
      {currentUser && (
        <p className="text-gray-600 mb-4">
          Logged in as: {currentUser.email}
        </p>
      )}

      {/* If viewing a status in full-screen */}
      {fullScreenStatusIndex !== null ? (
        <div
          className="fixed inset-0 bg-black flex justify-center items-center z-50"
          onClick={handleNextStatus} // Tap to go to next status
          {...swipeHandlers} // Attach swipe gesture handlers
        >
          <div className="relative w-full h-full">
            {/* Show the uploader's name */}
            <div className="absolute top-5 left-5 text-white font-bold text-lg">
              {statusList[fullScreenStatusIndex]?.name}
            </div>

            {/* Close button */}
            <button
              className="absolute top-5 right-5 text-white font-bold"
              onClick={() => setFullScreenStatusIndex(null)} // Close the full-screen view
            >
              X
            </button>

            {/* Display loading spinner while media is loading */}
            {isLoading && (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="spinner">Loading...</div>
              </div>
            )}

            {/* Display full-screen image or video */}
            {statusList[fullScreenStatusIndex]?.mediaType === "image" ? (
              <img
                src={statusList[fullScreenStatusIndex].mediaUrl}
                alt="Status"
                className="w-full h-full object-contain"
                onLoad={handleMediaLoad} // Mark media as loaded
              />
            ) : (
              <video
                src={statusList[fullScreenStatusIndex].mediaUrl}
                autoPlay
                loop
                muted={isMuted} // Control the mute state for the video
                onEnded={handleStatusEnd} // Move to next status when video ends
                controls={false} // No controls for a more immersive experience
                className="w-full h-full object-contain"
                onCanPlay={handleMediaLoad} // Mark media as loaded when video can play
              />
            )}

            {/* Mute/unmute button */}
            <button
              className="absolute bottom-5 right-5 text-white font-bold"
              onClick={toggleMute} // Toggle mute/unmute
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>

            {/* Swipe-up to move to next status (for YouTube Shorts-like behavior) */}
            <div
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-lg cursor-pointer"
              onClick={handleNextStatus}
            >
              Swipe up or tap to skip
            </div>
          </div>
        </div>
      ) : (
        // Display normal status list
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Status Updates</h3>
          {statusList.length === 0 ? (
            <p>No status updates yet.</p>
          ) : (
            <div className="overflow-x-scroll flex space-x-4 py-4">
              {statusList.map((status, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-white p-4 shadow-md rounded-lg w-64"
                  onClick={() => setFullScreenStatusIndex(index)} // Open selected status in full screen
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={status.profileImage}
                      alt={status.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <p className="ml-4 font-bold text-sm">{status.name}</p>
                  </div>
                  {status.mediaType === "image" ? (
                    <img
                      src={status.mediaUrl}
                      alt="Status"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={status.mediaUrl}
                      controls
                      className="w-full h-48 mb-4"
                    />
                  )}
                  <p className="text-gray-600 text-sm">Uploaded by: {status.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusViewPage;
