import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/firebase';
import { collection, addDoc, getDocs, } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const GroupChat = ({ user }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([user.email]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupImage, setGroupImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName || groupMembers.length < 2) {
      alert('Please provide a group name and select at least one other member.');
      return;
    }

    setLoading(true);

    let imageUrl = '';

    if (groupImage) {
      const imageRef = ref(storage, `group_images/${Date.now()}_${groupImage.name}`);
      const uploadTask = uploadBytesResumable(imageRef, groupImage);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          console.error('Error uploading image: ', error);
          alert('There was an error uploading the image.');
          setLoading(false);
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          createGroup(imageUrl);
        }
      );
    } else {
      createGroup(imageUrl);
    }
  };

  const createGroup = async (imageUrl) => {
    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroupName,
        members: groupMembers,
        image: imageUrl,
        admin: user.email,
        messages: [],
      });

      setNewGroupName('');
      setGroupMembers([user.email]);
      setGroupImage(null);

      alert('Group created successfully! You can now find it on the homepage.');
      navigate('/'); // Redirect back to homepage
    } catch (e) {
      console.error('Error creating group: ', e);
      alert('There was an error creating the group.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = (email) => {
    if (groupMembers.includes(email)) {
      setGroupMembers(groupMembers.filter((member) => member !== email));
    } else {
      setGroupMembers([...groupMembers, email]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">Create a New Group</h1>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <input
          type="text"
          placeholder="Enter new group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="border p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mb-4">
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded p-2"
          />
          {groupImage && <p className="text-sm text-gray-600 mt-2">Image selected: {groupImage.name}</p>}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Select Members:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((userData) => (
              userData.email !== user.email && (
                <div
                  key={userData.email}
                  className={`p-4 cursor-pointer rounded-lg border-2 ${groupMembers.includes(userData.email) ? 'bg-blue-200 border-blue-500' : 'bg-gray-200 border-gray-300'} hover:bg-blue-300 transition`}
                  onClick={() => handleToggleMember(userData.email)}
                >
                  <p className="font-semibold">{userData.name}</p>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                </div>
              )
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateGroup}
          className={`w-full py-3 text-white rounded-lg ${loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} transition ease-in-out duration-200`}
          disabled={loading}
        >
          {loading ? 'Creating Group...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
