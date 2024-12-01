import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc, setDoc, addDoc, collection, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { uploadBytesResumable, getDownloadURL, ref } from 'firebase/storage';
import { IoArrowBack, IoSend, IoAttach, IoHappy, IoTrash } from 'react-icons/io5'; 
import Navbar from '../components/UI/Navbar';
import ProfileView from './ProfileView';
import EmojiPicker from 'emoji-picker-react'; 

const ChatPage = ({ user }) => {
  const { userId } = useParams();
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);  // For full-screen image preview
  const [isProfileViewVisible, setIsProfileViewVisible] = useState(false);
  const [file, setFile] = useState(null);  // For the file input
  const [fileType, setFileType] = useState(null); // For image/pdf file type
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // State for upload progress
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Fetch chat user and set up the real-time listener for messages
  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setChatUser(userDoc.data());
        } else {
          console.error('User not found');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchChatUser();

    const chatId = user.uid < userId ? user.uid + userId : userId + user.uid;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArr = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesArr);
    });

    return () => unsubscribe();
  }, [userId, user.uid, navigate]);

  // Send message function (handles text and file sending)
  const sendMessage = async () => {
    if (newMessage.trim() === '' && !file) return; // Prevent sending empty messages

    const chatId = user.uid < userId ? user.uid + userId : userId + user.uid;

    try {
      const chatDocRef = doc(db, 'chats', chatId);

      if (!(await getDoc(chatDocRef)).exists()) {
        await setDoc(chatDocRef, {
          users: [user.uid, userId],
          lastUpdated: new Date(),
        });
      }

      let fileUrl = null;
      if (file) {
        // Upload file and handle progress
        const fileRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Set progress
          },
          (error) => {
            console.error('Error uploading file:', error);
            setUploadProgress(null); // Reset progress on error
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            fileUrl = downloadURL;
            setUploadProgress(null); // Reset progress after upload
            sendMessageWithFile(fileUrl); // Send message with the file URL
          }
        );
      } else {
        sendMessageWithFile(fileUrl); // Send message without file if none selected
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Helper function to send a message with or without file
  const sendMessageWithFile = async (fileUrl) => {
    const chatId = user.uid < userId ? user.uid + userId : userId + user.uid;

    try {
      const messageData = {
        text: newMessage,
        senderId: user.uid,
        receiverId: userId,
        timestamp: new Date(),
        status: 'sent',
        fileUrl: fileUrl,
        fileType: fileType, // Include file type (image/pdf)
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Reset message and file states after sending
      setNewMessage('');
      setFile(null);
      setFileType(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format message text (handle new lines)
  const formatMessageText = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  // Handle image click to preview it
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl); // Set selected image for full-screen view
  };

  // Close the full-screen image modal
  const closeImageModal = () => {
    setSelectedImage(null); // Close the modal
  };

  // Handle text input changes
  const handleTextAreaChange = (e) => {
    setNewMessage(e.target.value);
    autoResizeTextArea(e.target);
  };

  // Auto resize the text area based on the input text
  const autoResizeTextArea = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Handle emoji picker selection
  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.emoji);
    setShowEmojiPicker(false); // Close emoji picker after selection
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      const type = selectedFile.type.startsWith('image') ? 'image' : selectedFile.type === 'application/pdf' ? 'pdf' : '';
      setFileType(type);
    }
  };

  // Delete a specific message
  const deleteMessage = async (messageId) => {
    const chatId = user.uid < userId ? user.uid + userId : userId + user.uid;

    try {
      await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
      console.log('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (!chatUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-blue-100 flex flex-col relative">
      <div className="absolute inset-0 bg-black opacity-30 z-10"></div>

      <Navbar user={user} onLogout={() => {}} />

      <div className="relative z-20 bg-blue-600 p-4 flex items-center border-b">
        <button onClick={() => navigate(-1)} className="mr-4 text-white hover:text-gray-300">
          <IoArrowBack size={24} />
        </button>

        <img
          src={chatUser.profileImage || 'https://via.placeholder.com/50'}
          alt={chatUser.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="ml-4 flex flex-col">
          <span
            className="font-semibold text-white cursor-pointer"
            onClick={() => setIsProfileViewVisible(true)}
          >
            {chatUser.name}
          </span>
        </div>
      </div>

      {isProfileViewVisible && (
        <ProfileView userId={userId} setIsProfileViewVisible={setIsProfileViewVisible} />
      )}

      <div className="flex-1 p-4 overflow-y-auto bg-white bg-opacity-60 z-20">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'} relative`}
            >
              <div className="relative max-w-xs rounded-lg px-4 py-2 bg-blue-200 text-black">
                {message.fileUrl && message.fileType === 'image' && (
                  <div onClick={() => handleImageClick(message.fileUrl)}>
                    <img
                      src={message.fileUrl}
                      alt="uploaded"
                      className="w-40 h-40 object-cover rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {message.fileUrl && message.fileType === 'pdf' && (
                  <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-md">Open PDF</button>
                  </a>
                )}

                <span>{formatMessageText(message.text)}</span>

                {message.senderId === user.uid && (
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="absolute top-0 right-0 p-1 text-xs text-red-500"
                  >
                    <IoTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white flex items-center shadow-md z-20">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xl">
          <IoHappy />
        </button>

        {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}

        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={handleTextAreaChange}
          rows={1}
          className="flex-1 p-2 ml-2 border border-gray-300 rounded-md resize-none"
          placeholder="Type a message"
        />

        {/* Progress bar when file is uploading */}
        {uploadProgress !== null && (
          <div className="w-full mt-2">
            <div className="bg-gray-200 w-full h-2 rounded-lg">
              <div
                className="bg-blue-500 h-2 rounded-lg"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(uploadProgress)}% Uploading...</span>
          </div>
        )}

        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
        />

        <label htmlFor="file-input" className="cursor-pointer">
          <IoAttach size={24} />
        </label>

        <button onClick={sendMessage} className="ml-2 p-2 text-white bg-blue-500 rounded-full">
          <IoSend size={24} />
        </button>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex items-center justify-center">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={closeImageModal}
            >
              ×
            </button>
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
