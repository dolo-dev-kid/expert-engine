import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Landing from "./components/Landing";
import Feed from "./components/Feed";
import VideoChat from "./components/VideoChat";
import ChatPanel from "./components/ChatPanel";
import Profile from "./components/Profile";
import Friends from "./components/Friends";
import Servers from "./components/Servers";
import StreamDashboard from "./components/StreamDashboard";
import Overlay from "./components/Overlay";

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
        {page === "profile" && <Profile />}
        {page === "friends" && <Friends />}
        {page === "servers" && <Servers />}
        {page === "dashboard" && <StreamDashboard />}
        {page === "overlay" && <Overlay />}
      </div>
    </div>
  );
}


  
