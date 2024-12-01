import React, { useState, useEffect, useRef, useCallback } from "react";
import { BsPaperclip, BsSend } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import { ImSmile } from "react-icons/im";
import { AiOutlineAudio, AiOutlineFile } from "react-icons/ai";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Picker from "emoji-picker-react";

const MessageInput = ({ conversationId, user }) => {
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [isFilePopupVisible, setIsFilePopupVisible] = useState(false);
  const mediaRecorderRef = useRef(null);
  const textareaRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const handleEmojiClick = useCallback((emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      setMessageText((prevMessageText) => prevMessageText + emojiObject.emoji);
    }
  }, []);

  const handleSendMessage = async () => {
    if ((messageText.trim() === "" && !file && !audioBlob) || loading) return;
    setLoading(true);

    try {
      const messageData = {
        senderId: user.uid,
        timestamp: serverTimestamp(),
      };

      if (messageText.trim()) {
        messageData.text = messageText.trim();
      }

      if (file) {
        const storageRef = ref(storage, `conversations/${conversationId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            reject,
            async () => {
              const fileUrl = await getDownloadURL(storageRef);
              messageData.file = {
                name: file.name,
                url: fileUrl,
                type: file.type.startsWith("image/") ? "image" : "document",
              };
              resolve();
            }
          );
        });
        setFile(null);
      }

      if (audioBlob) {
        const storageRef = ref(storage, `conversations/${conversationId}/audio_${Date.now()}.webm`);
        const uploadTask = uploadBytesResumable(storageRef, audioBlob);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            reject,
            async () => {
              const audioUrl = await getDownloadURL(storageRef);
              messageData.audio = { url: audioUrl, duration: audioDuration };
              resolve();
            }
          );
        });
        setAudioBlob(null);
      }

      await addDoc(collection(db, "conversations", conversationId, "messages"), messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      resetMessageInput();
    }
  };

  const resetMessageInput = () => {
    setMessageText("");
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioDuration(0);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "inherit";
    }
  };

  const handleTextareaChange = (e) => {
    setMessageText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // Max height of 200px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const startRecording = async () => {
    if (isRecording) return;

    setIsRecording(true);
    setRecordingTimer(0);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTimer((prev) => prev + 1);
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        clearInterval(recordingIntervalRef.current);
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));

        const audioElement = new Audio(URL.createObjectURL(audioBlob));
        audioElement.onloadedmetadata = () => {
          setAudioDuration(Math.floor(audioElement.duration));
        };

        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing the microphone", err);
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    clearInterval(recordingIntervalRef.current);
  };

  // Close file upload popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.file-popup') && !event.target.closest('.file-attach-button')) {
        setIsFilePopupVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 flex items-center justify-between bg-gray-100 border-t border-gray-300 shadow-lg rounded-lg max-w-4xl mx-auto mt-4 relative">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={messageText}
        onChange={handleTextareaChange}
        placeholder="Type a message..."
        className="flex-1 p-3 rounded-xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-hidden"
        rows="1"
      />

      {/* Emoji Picker Button */}
      <button
        onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition duration-200"
      >
        <ImSmile size={20} />
      </button>

      {/* Emoji Picker */}
      {emojiPickerVisible && (
        <div
          className="absolute z-50 w-64 max-h-80 overflow-y-auto bg-white border rounded-lg shadow-lg"
          style={{
            bottom: emojiPickerVisible ? "70px" : "auto",
            left: "10px",
            right: "auto",
          }}
        >
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* File & Audio Buttons */}
      <div className="relative flex items-center space-x-4">
        {/* Attach file icon */}
        <button
          onClick={() => setIsFilePopupVisible(!isFilePopupVisible)}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition duration-200 file-attach-button"
        >
          <BsPaperclip size={20} />
        </button>

        {/* File upload popup */}
        {isFilePopupVisible && (
          <div className="absolute bottom-14 left-0 z-50 w-72 bg-white border rounded-lg shadow-lg p-4 space-y-2 file-popup">
            <label className="cursor-pointer text-gray-700 hover:text-gray-900 flex items-center space-x-2">
              <FaFilePdf size={20} />
              <span>PDF</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                accept="application/pdf"
              />
            </label>
            <label className="cursor-pointer text-gray-700 hover:text-gray-900 flex items-center space-x-2">
              <AiOutlineAudio size={20} />
              <span>Audio</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                accept="audio/*"
              />
            </label>
            {/* New Image Upload Option */}
            <label className="cursor-pointer text-gray-700 hover:text-gray-900 flex items-center space-x-2">
              <AiOutlineFile size={20} />
              <span>Image</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition duration-200"
        >
          <BsSend size={20} />
        </button>
      </div>

      {/* Audio Recording */}
      <div>
        {isRecording ? (
          <div>
            <span>{recordingTimer}s</span>
            <button onClick={stopRecording} className="p-2">
              Stop
            </button>
          </div>
        ) : (
          <button onClick={startRecording} className="p-2">
            <AiOutlineAudio size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
