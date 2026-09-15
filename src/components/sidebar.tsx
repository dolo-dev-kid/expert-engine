export default function Sidebar({ onNavigate }) {
  return (
    <div
      style={{
        width: 80,
        background: "#1e1f22",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20,
        gap: 20
      }}
    >
      <button onClick={() => onNavigate("landing")} style={btn}>🏠</button>
      <button onClick={() => onNavigate("feed")} style={btn}>📱</button>
      <button onClick={() => onNavigate("video")} style={btn}>🎥</button>
      <button onClick={() => onNavigate("chat")} style={btn}>💬</button>
      <button onClick={() => onNavigate("profile")} style={btn}>👤</button>
      <button onClick={() => onNavigate("friends")} style={btn}>👥</button>
      <button onClick={() => onNavigate("servers")} style={btn}>🛡️</button>
      <button onClick={() => onNavigate("dashboard")} style={btn}>⚙️</button>
      <button onClick={() => onNavigate("overlay")} style={btn}>🎨</button>
    </div>
  );
}

const btn = {
  width: 50,
  height: 50,
  borderRadius: 12,
  background: "#2b2d31",
  color: "#fff",
  fontSize: 22,
  border: "none",
  cursor: "pointer"
};
