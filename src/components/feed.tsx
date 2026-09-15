export default function Feed() {
  const posts = [
    { user: "Alex", text: "Just went live 🔥" },
    { user: "Mia", text: "New stream layout dropping soon!" },
    { user: "Jay", text: "Anyone wanna VC?" }
  ];

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h2 style={{ marginBottom: 20 }}>Your Feed</h2>

      {posts.map((p, i) => (
        <div
          key={i}
          style={{
            background: "#1e1f22",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20
          }}
        >
          <strong>{p.user}</strong>
          <p style={{ marginTop: 10 }}>{p.text}</p>
        </div>
      ))}
    </div>
  );
}
