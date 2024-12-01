import { Navigate } from 'react-router-dom';

// PrivateRoute component jo check karta hai ki user login hai ya nahi
function PrivateRoute({ user, children }) {
  // Agar user login hai toh 'children' ko render karo (yani jo component route ke liye diya gaya ho)
  // Agar user login nahi hai, toh login page par redirect kar do
  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
