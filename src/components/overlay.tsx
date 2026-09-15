export default function Overlay() {
  return (
    <div
      style={{
        padding: 40,
        color: "white",
        background: "rgba(0,0,0,0.7)",
        height: "100%"
      }}
    >
      <h1>Overlay Editor</h1>

      <div
        style={{
          marginTop: 20,
          background: "#1e1f22",
          padding: 20,
          borderRadius: 12
        }}
      >
        <p>Add text, alerts, widgets, and more.</p>

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
          Add Widget
        </button>
      </div>
    </div>
  );
}
