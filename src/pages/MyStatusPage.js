import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, Timestamp, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const MyStatusPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [statusMedia, setStatusMedia] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [statusList, setStatusList] = useState([]);

  // User authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Unknown User",
          profileImage: user.photoURL || "https://via.placeholder.com/150",
        });
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Handle media selection (image/video)
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    
    if (file && (file.type.startsWith("image") || file.type.startsWith("video"))) {
      setStatusMedia(file);
      setPreviewMedia(URL.createObjectURL(file));

      if (file.type.startsWith("video")) {
        const videoElement = document.createElement("video");
        videoElement.src = URL.createObjectURL(file);
        videoElement.onloadedmetadata = () => {
          if (videoElement.duration > 60) {
            alert("कृपया 1 मिनट से कम की वीडियो अपलोड करें।");
            setStatusMedia(null);
            setPreviewMedia(null);
          }
        };
      }
    } else {
      alert("कृपया इमेज या वीडियो चुनें।");
    }
  };

  // Handle status upload
  const handleStatusUpload = async () => {
    if (!statusMedia) {
      alert("कृपया इमेज या वीडियो अपलोड करें।");
      return;
    }

    const mediaRef = ref(storage, `status/${currentUser.uid}/${statusMedia.name}`);
    const uploadTask = uploadBytesResumable(mediaRef, statusMedia);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => alert("फाइल अपलोड करते समय त्रुटि:", error.message),
      async () => {
        const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);

        await addDoc(collection(db, "status"), {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.name,
          profileImage: currentUser.profileImage,
          mediaUrl,
          mediaType: statusMedia.type.startsWith("image") ? "image" : "video",
          timestamp: Timestamp.fromDate(new Date()),
        });

        alert("स्टेटस सफलतापूर्वक अपलोड हो गया!");
        setUploadProgress(null);
        setStatusMedia(null);
        setPreviewMedia(null);
      }
    );
  };

  // Handle status deletion
  const handleStatusDelete = async (statusId, mediaUrl) => {
    try {
      // Delete the file from Firebase storage
      const mediaRef = ref(storage, mediaUrl);
      await deleteObject(mediaRef);

      // Delete the status from Firestore
      const statusDocRef = doc(db, "status", statusId);
      await deleteDoc(statusDocRef);

      alert("Status successfully deleted.");
    } catch (error) {
      alert("Error deleting status:", error.message);
    }
  };

  // Automatically delete statuses older than 24 hours
  useEffect(() => {
    const deleteOldStatuses = async () => {
      if (currentUser) {
        const now = Timestamp.now();
        const twentyFourHoursAgo = new Timestamp(now.seconds - 24 * 60 * 60, now.nanoseconds); // 24 hours ago

        const unsubscribe = onSnapshot(
          query(
            collection(db, "status"),
            where("email", "==", currentUser.email),
            where("timestamp", "<", twentyFourHoursAgo)
          ),
          async (snapshot) => {
            snapshot.docs.forEach(async (doc) => {
              // Delete old statuses
              const statusData = doc.data();
              await handleStatusDelete(doc.id, statusData.mediaUrl);
            });
          }
        );
        return () => unsubscribe();
      }
    };

    deleteOldStatuses();
  }, [currentUser]);

  // Load statuses from Firestore
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(
        query(
          collection(db, "status"),
          where("email", "==", currentUser.email)
        ),
        (snapshot) => {
          const statuses = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
          setStatusList(statuses);
        }
      );
      return () => unsubscribe();
    }
  }, [currentUser]);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header for "My Status" */}
      <div className="bg-green-500 py-4 px-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Status</h2>
        {currentUser && (
          <img
            src={currentUser.profileImage}
            alt="Profile"
            className="w-12 h-12 rounded-full border-4 border-white"
          />
        )}
      </div>

      {/* Status Upload Section */}
      <div className="px-6 py-4 bg-white rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-3">Upload New Status</h3>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleMediaChange}
          className="block w-full text-gray-700 p-3 rounded-lg border-2 border-gray-300 mb-4"
        />
        {previewMedia && (
          <div className="mb-4">
            {statusMedia?.type.startsWith("image") ? (
              <img
                src={previewMedia}
                alt="Media Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <video
                src={previewMedia}
                controls
                className="w-full h-48 rounded-lg"
              />
            )}
          </div>
        )}
        {uploadProgress !== null && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h4 className="text-sm text-gray-600 mb-2">Upload Progress</h4>
            <div className="w-full bg-gray-300 h-2.5 rounded-full">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-gray-700 mt-2">{Math.round(uploadProgress)}%</p>
          </div>
        )}

        {/* Advanced Upload Button */}
        <button
          onClick={handleStatusUpload}
          className="w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all ease-in-out duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 flex items-center justify-center relative"
        >
          {uploadProgress === null || uploadProgress === 100 ? (
            <span>Upload Status</span>
          ) : (
            <div className="animate-spin rounded-full border-4 border-t-4 border-white w-5 h-5"></div> // Spinner
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 absolute right-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Status List */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
        <div className="flex overflow-x-scroll space-x-4">
          {statusList.map((status) => (
            <div key={status.id} className="relative">
              <img
                src={status.profileImage}
                alt={status.name}
                className="w-20 h-20 rounded-full border-4 border-white"
              />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded-full shadow-md">
                <span className="text-xs font-bold">{status.name}</span>
              </div>
              <div className="mt-2">
                {status.mediaType === "image" ? (
                  <img
                    src={status.mediaUrl}
                    alt="Status"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={status.mediaUrl}
                    controls
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
              {/* Delete Button */}
              <button
                onClick={() => handleStatusDelete(status.id, status.mediaUrl)}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Uploading */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => document.getElementById("file-input").click()}
          className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <input
          type="file"
          id="file-input"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleMediaChange}
        />
      </div>
    </div>
  );
};

export default MyStatusPage;
