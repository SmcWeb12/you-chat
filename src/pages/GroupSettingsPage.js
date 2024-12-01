import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 

const GroupSettingsPage = ({ user }) => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState({ name: '', description: '', members: [], bio: '', adminMessagesOnly: false });
  const [newGroupName, setNewGroupName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // State to check if user is admin
  const navigate = useNavigate();

  // Fetch the current group information and check if user is admin
  useEffect(() => {
    const groupRef = doc(db, 'groups', groupId);
    const fetchGroupInfo = async () => {
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const data = groupSnap.data();
        setGroupInfo(data);
        setNewGroupName(data.name);
        setNewDescription(data.description);
        setNewBio(data.bio || '');
        setIsAdmin(data.admin === user.email); // Check if the current user is the admin

        if (data.admin !== user.email) {
          setError('You are not authorized to edit this group!');
          navigate(`/group/${groupId}`); // Redirect if user is not admin
        }
      } else {
        setError('Group not found!');
        navigate('/groups'); // Redirect if group not found
      }
    };
    fetchGroupInfo();
  }, [groupId, user.email, navigate]);

  // Handle adding/removing members
  const handleAddMember = async () => {
    if (!newMemberEmail) {
      setError('Please enter a valid email.');
      return;
    }

    const newMembers = [...groupInfo.members, newMemberEmail];
    await updateDoc(doc(db, 'groups', groupId), { members: newMembers });
    setGroupInfo((prev) => ({ ...prev, members: newMembers }));
    setNewMemberEmail('');
  };

  const handleRemoveMember = async (email) => {
    const updatedMembers = groupInfo.members.filter((member) => member !== email);
    await updateDoc(doc(db, 'groups', groupId), { members: updatedMembers });
    setGroupInfo((prev) => ({ ...prev, members: updatedMembers }));
  };

  // Handle toggle for admin message only
  const handleToggleAdminMessages = async () => {
    const newAdminMessagesOnly = !groupInfo.adminMessagesOnly;
    await updateDoc(doc(db, 'groups', groupId), { adminMessagesOnly: newAdminMessagesOnly });
    setGroupInfo((prev) => ({ ...prev, adminMessagesOnly: newAdminMessagesOnly }));
  };

  // Handle saving group settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('You are not authorized to edit this group!');
      return;
    }

    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        name: newGroupName,
        description: newDescription,
        bio: newBio,
      });
      navigate(`/group/${groupId}`); // Navigate back after saving changes
    } catch (err) {
      setError('Error updating group settings. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Group Settings</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isAdmin && (
        <form onSubmit={handleSaveSettings} className="w-full max-w-lg bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-bold text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="groupDescription" className="block text-sm font-bold text-gray-700">
              Group Description
            </label>
            <textarea
              id="groupDescription"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter group description"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="groupBio" className="block text-sm font-bold text-gray-700">
              Group Bio
            </label>
            <textarea
              id="groupBio"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter group bio"
            />
          </div>

          <div className="mb-4 flex items-center">
            <label className="mr-2 text-sm font-bold text-gray-700">Admin Messages Only</label>
            <input
              type="checkbox"
              checked={groupInfo.adminMessagesOnly}
              onChange={handleToggleAdminMessages}
              className="mr-2"
            />
            <span className="text-sm text-gray-500">Allow only admin to send messages</span>
          </div>

          <div className="mb-4">
            <label htmlFor="addMember" className="block text-sm font-bold text-gray-700">
              Add Member (Email)
            </label>
            <input
              type="email"
              id="addMember"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter member email"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Member
            </button>
          </div>

          <div className="mb-4">
            <h2 className="font-bold text-lg">Members</h2>
            <ul className="list-none">
              {groupInfo.members.map((member) => (
                <li key={member} className="flex justify-between items-center mb-2">
                  <span>{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(`/group/${groupId}`)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GroupSettingsPage;
