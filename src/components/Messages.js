// src/components/Messages.js
import React from 'react';

const Messages = ({ messages, currentUser }) => {
  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.sender === currentUser ? 'sent' : 'received'}`}
        >
          <p>{message.text}</p>
          <span className="timestamp">{message.timestamp}</span>
        </div>
      ))}
      <style jsx>{`
        .messages-container {
          padding: 10px;
          overflow-y: scroll;
          height: 80vh;
        }
        .message {
          max-width: 80%;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 10px;
          background-color: #f1f1f1;
        }
        .sent {
          background-color: #dcf8c6;
          margin-left: auto;
        }
        .received {
          background-color: #fff;
          margin-right: auto;
        }
        .timestamp {
          font-size: 0.8rem;
          color: gray;
          display: block;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default Messages;
