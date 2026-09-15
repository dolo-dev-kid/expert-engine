export default function Profile() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Your Profile</h1>

      <div
        style={{
          marginTop: 20,
          background: "#1e1f22",
          padding: 20,
          borderRadius: 12,
          width: 400
        }}
      >
        <img
          src="https://i.imgur.com/4ZQZ4ZQ.png"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            marginBottom: 20
          }}
        />

        <h2>DOLO45-tapp-in</h2>
        <p style={{ marginTop: 10 }}>Streamer • Creator • Dreamer</p>

        <button
          style={{
            marginTop: 20,
            padding: "12px 20px",
            borderRadius: 8,
            background: "#00eaff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
