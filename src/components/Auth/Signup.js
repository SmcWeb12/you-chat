import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';  // Firebase config import
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';  // Firebase Firestore config

function Signup() {
  const [email, setEmail] = useState('');  // Email state
  const [password, setPassword] = useState('');  // Password state
  const [name, setName] = useState('');  // Name state
  const [error, setError] = useState('');  // Error state

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user details to Firestore (name, email)
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        uid: user.uid
      });

      // Redirect or update UI after successful signup
      console.log('User created successfully');
      // Optionally, you can redirect to another page (e.g., HomePage)
      // For example, use `useNavigate` from 'react-router-dom' to navigate
    } catch (err) {
      // Handle error (e.g., weak password, email already in use)
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-700 mb-6">Sign Up</h2>
        
        {error && <div className="text-red-500 text-center mb-4">{error}</div>} {/* Error message */}
        
        <form onSubmit={handleSignup}>
          {/* Name input */}
          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Email input */}
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Password input */}
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? 
          <a href="/login" className="text-blue-500 hover:text-blue-700">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
