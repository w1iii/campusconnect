  import { useEffect, useState, useRef } from "react";
  import { useLocation, Link } from "react-router-dom";
  import socket from "./server/socket";
  import "./ChatRoom.css";

  const universities = {
    usls: { name: "University of St. La Salle", logo: "/usls.png" },
    csab: { name: "Colegio San Agustin Bacolod", logo: "/csab.png" },
    rci: { name: "Riverside College Inc.", logo: "/rci.png" },
    nu: { name: "National University", logo: "/nu.png" },
    chmsu: { name: "Carlos Hilado Memorial State University", logo: "/chmsu.png" },
    unor: { name: "University of Negros Occidental Recoletos", logo: "/unor.png" },
  };

  function ChatRoom({ username }) {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const school = params.get("school");

    const mySchool = universities[school];
    const [partner, setPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [partnerLeft, setPartnerLeft] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const chatEndRef = useRef(null);

    // Auto scroll chat
    useEffect(() => {
      if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
      if (!mySchool || !username) return;

      const joinQueue = () => {
        setIsMatching(true);
        setPartner(null);
        setPartnerLeft(false);
        setMessages([{ from: "system", text: "🔍 Searching for a partner..." }]);
        socket.emit("joinQueue", { school, username });
      };

      joinQueue();

      socket.on("connect", () => console.log("✅ Connected:", socket.id));
      socket.on("disconnect", () => console.log("❌ Disconnected"));
      socket.on("reconnect", () => {
        console.log("♻️ Reconnected");
        joinQueue(); // Auto rejoin queue on reconnect
      });

      socket.on("matched", (partnerData) => {
        setPartner({
          school: partnerData.school,
          username: partnerData.username,
        });
        setIsMatching(false);
        setPartnerLeft(false);
        setMessages([
          {
            from: "system",
          },
        ]);
      });

      socket.on("receiveMessage", (data) => {
        setMessages((prev) => [...prev, { from: "partner", text: data.text, username: data.username }]);
      });

      socket.on("partnerLeft", () => {
        setMessages((prev) => [...prev, { from: "system", text: "😢 Your partner left the chat." }]);
        setPartnerLeft(true);
        setPartner(null);
        setIsMatching(false);
      });

      return () => {
        socket.off("matched");
        socket.off("receiveMessage");
        socket.off("partnerLeft");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("reconnect");
        // ❗️ Do NOT disconnect the socket — just leave the queue
        socket.emit("leaveQueue");
      };
    }, [school, username]);

    const sendMessage = (e) => {
      e.preventDefault();
      if (!input.trim() || !partner) return;

      socket.emit("sendMessage", { text: input, username });
      setMessages((prev) => [...prev, { from: "me", text: input, username }]);
      setInput("");
    };

    const findNext = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        socket.emit("leaveQueue");
        setPartner(null);
        setPartnerLeft(false);
        setMessages([{ from: "system", text: "🔍 Finding a new partner..." }]);
        socket.emit("joinQueue", { school, username });
        setIsMatching(true);
        setIsTransitioning(false);
      }, 800);
    };

    if (!mySchool) return <div>Invalid school. <Link to="/">Back</Link></div>;

    return (
      <div className={`chat-container ${isTransitioning ? "fade-out" : ""}`}>
        <div className="chat-header">
          <h1>{mySchool.name}</h1>
          {partner ? (
            <div className="partner">
              Chatting with {partner.username} from {universities[partner.school].name}
            </div>
          ) : partnerLeft ? (
            <div className="partner-left">❌ Partner disconnected</div>
          ) : (
            <div className="status">
              {isMatching ? (
                <div className="loading-dots"><span></span><span></span><span></span></div>
              ) : (
                "Waiting for a match..."
              )}
            </div>
          )}
        </div>

        <div className="chat-box">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.from}`}>
              {m.from === "system" ? (
                <em>{m.text}</em>
              ) : (
                <>
                  <strong>{m.from === "me" ? `${username}:` : `${m.username || "User"}:`}</strong>{" "}
                  {m.text}
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-controls">
          {partner && !partnerLeft && (
            <form onSubmit={sendMessage} className="chat-form">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          )}

          <div className="chat-actions">
            {partner && <button onClick={findNext}>Next</button>}
            {partnerLeft && <button onClick={findNext}>🔄 Find New Partner</button>}
            <Link to="/" className="leave-link">Leave</Link>
          </div>
        </div>
      </div>
    );
  }

  export default ChatRoom;
