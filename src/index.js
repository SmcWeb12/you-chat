import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import App from './App'; // Ensure the App is imported correctly

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);
