/* eslint-disable react-refresh/only-export-components */
// main.jsx
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ChatRoom from "./ChatRoom.jsx";


function Root() {
  const [username, setUsername] = useState(() => localStorage.getItem("cc_username") || "");
  const [inputValue, setInputValue] = useState("");

  const handleSetUsername = (name) => {
    localStorage.setItem("cc_username", name);
    setUsername(name);
  };

  if (!username) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <h2>Welcome to Campus Connect</h2>
          <p>Enter a username to start chatting</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) handleSetUsername(inputValue.trim());
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
