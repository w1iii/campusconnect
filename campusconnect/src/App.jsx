import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./index.css";

const universities = {
  usls: { name: "University of St. La Salle", logo: "/usls.png" },
  csab: { name: "Colegio San Agustin Bacolod", logo: "/csab.png" },
  rci: { name: "Riverside College Inc.", logo: "/rci.png" },
  nu: { name: "National University", logo: "/nu.png" },
  chmsu: { name: "Carlos Hilado Memorial State University", logo: "/chmsu.png" },
  unor: { name: "University of Negros Occidental Recoletos", logo: "/unor.png" },
};

function App() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  // 🔄 Update the body class when dark mode toggles
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDark]);

  const handleClick = (key) => {
    navigate(`/chat?school=${key}`);
  };

  return (
    <div className="main-container">
      <h1>Campus Connect</h1>

      {/* 🌙 / ☀️ Toggle button */}
      <button
        id="toggleTheme"
        onClick={() => setIsDark(!isDark)}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      <div className="logo-container">
        {Object.entries(universities).map(([key, uni]) => (
          <img
            key={key}
            src={uni.logo}
            alt={uni.name}
            className="logo"
            onClick={() => handleClick(key)}
          />
        ))}
      </div>

      <p>Choose your university to start chatting with random students across the city.</p>
    </div>
  );
}

export default App;
