import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { FaCog, FaInfoCircle } from "react-icons/fa";

const GroupChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { groupId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        setLoading(true);

        // ग्रुप डेटा चेक करें
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const groupData = groupSnap.data();
          if (groupData.members.includes(user.email)) {
            setGroupInfo(groupData);

            // प्रोफाइल डेटा लोड करें
            const profiles = {};
            await Promise.all(
              groupData.members.map(async (memberEmail) => {
                const userRef = doc(db, "users", memberEmail);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  profiles[memberEmail] = userSnap.data();
                }
              })
            );
            setUserProfiles(profiles);

            // मैसेजेस लोड करें
            const messagesRef = collection(db, "groups", groupId, "messages");
            const q = query(messagesRef, orderBy("timestamp"));
            onSnapshot(q, (querySnapshot) => {
              const fetchedMessages = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setMessages(fetchedMessages);
            });
          } else {
            setError("You are not a member of this group.");
          }
        } else {
          setError("Group not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load group.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndMessages();
  }, [groupId, user.email]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      await addDoc(collection(db, "groups", groupId, "messages"), {
        text: newMessage,
        sender: user.email,
        timestamp: new Date(),
      });
      setNewMessage("");
      setTyping(false);
    } catch (error) {
      console.error("Error sending message: ", error);
      alert("Error sending message. Please try again.");
    }
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const messageRef = doc(db, "groups", groupId, "messages", messageId);
      await updateDoc(messageRef, { text: "[Message deleted]" });
    } catch (error) {
      console.error("Error deleting message: ", error);
      alert("Error deleting message. Please try again.");
    }
  };

  const handleSettingsClick = () => {
    navigate(`/group/${groupId}/settings`);
  };

  const handleAboutClick = () => {
    navigate(`/group/${groupId}/about`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      {groupInfo && (
        <div className="p-4 bg-blue-600 text-white shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{groupInfo.name}</h1>
            {groupInfo.description && <p className="text-sm">{groupInfo.description}</p>}
            <p className="text-sm">Members: {groupInfo.members.join(", ")}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSettingsClick} className="text-white p-2">
              <FaCog size={24} />
            </button>
            <button onClick={handleAboutClick} className="text-white p-2">
              <FaInfoCircle size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-grow overflow-y-auto bg-gray-100 p-4">
        {messages.map((msg) => {
          const senderProfile = userProfiles[msg.sender] || {};
          return (
            <div
              key={msg.id}
              className={`mb-4 flex ${
                msg.sender === user.email ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender !== user.email && senderProfile.photoURL && (
                <img
                  src={senderProfile.photoURL}
                  alt={`${senderProfile.name || "User"}`}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`p-3 rounded-lg max-w-xs shadow-md ${
                  msg.sender === user.email
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.sender !== user.email && (
                  <p className="text-sm font-bold">{senderProfile.name || msg.sender}</p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(msg.timestamp?.toDate()).toLocaleTimeString()}
                </p>
                {msg.sender === user.email && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="text-xs text-red-400 mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {typing && <div className="italic text-gray-500">Someone is typing...</div>}
      </div>

      {/* Input */}
      <div className="flex items-center p-4 border-t bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          className="flex-grow p-2 border rounded-lg outline-none mr-2"
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChatPage;
