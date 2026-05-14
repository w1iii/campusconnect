// main.jsx
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ChatRoom from "./ChatRoom.jsx";


function Root() {
  const [username, setUsername] = useState("");
  const [inputValue, setInputValue] = useState("");

  if (!username) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <h2>Welcome to Campus Connect</h2>
          <p>Enter a username to start chatting</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) setUsername(inputValue.trim());
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Your name..."
              className="modal-input"
              autoFocus
            />
            <button type="submit" className="modal-button">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App username={username} />} />
        <Route path="/chat" element={<ChatRoom username={username} />} />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
