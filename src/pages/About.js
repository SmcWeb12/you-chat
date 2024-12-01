import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const About = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    const groupRef = doc(db, 'groups', groupId);
    const fetchGroupInfo = async () => {
      const docSnap = await getDoc(groupRef);
      if (docSnap.exists()) {
        setGroupInfo(docSnap.data());
      }
    };
    fetchGroupInfo();
  }, [groupId]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {groupInfo ? (
        <>
          <h1 className="text-3xl font-semibold text-gray-800">{groupInfo.name}</h1>
          {groupInfo.description && (
            <p className="text-gray-600 mt-3">{groupInfo.description}</p>
          )}
          <div className="mt-4">
            <h2 className="text-xl font-medium text-gray-700">Members:</h2>
            <p className="text-gray-500">{groupInfo.members.join(', ')}</p>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Loading group information...</p>
      )}
    </div>
  );
};

export default About;
