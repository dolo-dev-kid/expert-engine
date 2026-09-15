export default function Servers() {
  const servers = ["Creators Hub", "Gamers Lounge", "Music Zone"];

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Your Servers</h1>

      {servers.map((s, i) => (
        <div
          key={i}
          style={{
            background: "#1e1f22",
            padding: 20,
            borderRadius: 12,
            marginTop: 20
          }}
        >
          {s}
        </div>
      ))}

      <button
        style={{
          marginTop: 30,
          padding: "12px 20px",
          borderRadius: 8,
          background: "#00eaff",
          border: "none",
          cursor: "pointer"
        }}
      >
        Create Server
      </button>
    </div>
  );
}
