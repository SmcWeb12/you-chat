import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import ItemCard from "./ItemCard"; // ItemCard इंपोर्ट किया

const GroupsPage = ({ user, handleSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const allGroups = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // सिर्फ वही ग्रुप्स फ़िल्टर करें जिनमें यूजर ऐड है
        const userGroups = allGroups.filter((group) =>
          group.members.includes(user.email)
        );
        setGroups(userGroups);
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user.email]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">My Groups</h2>
      {groups.length > 0 ? (
        groups.map((group) => (
          <ItemCard
            key={group.id}
            image={group.image || "https://via.placeholder.com/50"}
            title={group.name}
            subtitle={`${group.members.length} members`}
            onClick={() => handleSelectGroup(group)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500">
          No groups available. Create one to get started!
        </p>
      )}
    </div>
  );
};

export default GroupsPage;
