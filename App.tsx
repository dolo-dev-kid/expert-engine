// frontend/src/App.tsx
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function App() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const peer = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    socket.on("user-joined", async () => {
      await createOffer();
    });

    socket.on("offer", async (data) => {
      await handleOffer(data);
    });

    socket.on("answer", async (data) => {
      await handleAnswer(data);
    });

    socket.on("ice-candidate", async (data) => {
      if (peer.current) {
        await peer.current.addIceCandidate(data.candidate);
      }
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, `${data.from}: ${data.message}`]);
    });
  }, []);

  const joinRoom = async () => {
    setJoined(true);
    socket.emit("join-room", room);

    peer.current = new RTCPeerConnection();

    peer.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          room,
          candidate: event.candidate
        });
      }
    };

    peer.current.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      peer.current!.addTrack(track, stream);
    });
  };

  const createOffer = async () => {
    if (!peer.current) return;

    const offer = await peer.current.createOffer();
    await peer.current.setLocalDescription(offer);

    socket.emit("offer", {
      room,
      sdp: offer
    });
  };

  const handleOffer = async (data: any) => {
    if (!peer.current) return;

    await peer.current.setRemoteDescription(data.sdp);

    const answer = await peer.current.createAnswer();
    await peer.current.setLocalDescription(answer);

    socket.emit("answer", {
      room,
      sdp: answer
    });
  };

  const handleAnswer = async (data: any) => {
    if (!peer.current) return;
    await peer.current.setRemoteDescription(data.sdp);
  };

  const sendMessage = () => {
    socket.emit("chat-message", {
      room,
      message: input
    });
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      {!joined ? (
        <>
          <h2>Join a Room</h2>
          <input
            placeholder="Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </>
      ) : (
        <>
          <h2>Room: {room}</h2>

          <div style={{ display: "flex", gap: 20 }}>
            <video ref={localVideo} autoPlay playsInline muted width={300} />
            <video ref={remoteVideo} autoPlay playsInline width={300} />
          </div>

          <h3>Chat</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              height: 150,
              overflowY: "auto"
            }}
          >
            {messages.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>

          <input
            placeholder="Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </>
      )}
    </div>
  );
}

