import { useState } from "react";

export default function ChatPanel() {
  const [messages, setMessages] = useState(["Welcome to chat"]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h2>Messages</h2>

      <div
        style={{
          background: "#1e1f22",
          padding: 20,
          borderRadius: 12,
          height: 400,
          overflowY: "auto",
          marginBottom: 20
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            {m}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "80%",
          padding: 12,
          borderRadius: 8,
          border: "none",
          marginRight: 10
        }}
      />
      <button
        onClick={send}
        style={{
          padding: "12px 20px",
          borderRadius: 8,
          background: "#00eaff",
          border: "none",
          cursor: "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
}
