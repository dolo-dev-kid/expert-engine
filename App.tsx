import { useState } from "react";
import VideoChat from "./components/VideoChat";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import Landing from "./components/Landing";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f0f0f" }}>
      <Sidebar onNavigate={setPage} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {page === "landing" && <Landing />}
        {page === "feed" && <Feed />}
        {page === "video" && <VideoChat />}
        {page === "chat" && <ChatPanel />}
      </div>
    </div>
  );
}

  
