import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Update user profile
export const updateProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);
  return await updateDoc(userRef, data);
};

// Fetch all users
export const getUserList = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
