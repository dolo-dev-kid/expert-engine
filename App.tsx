import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function App() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const localVideo = useRef<HTMLVideoElement>(null);
  const peers = useRef<{ [id: string]: RTCPeerConnection }>({});
  const remoteVideos = useRef<{ [id: string]: HTMLVideoElement }>({});
  const videoContainer = useRef<HTMLDivElement>(null);

  const streamChunks = useRef<Uint8Array[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    socket.on("existing-users", async (users) => {
      for (const userId of users) {
        await createOffer(userId);
      }
    });

    socket.on("user-joined", async (userId) => {
      await createOffer(userId);
    });

    socket.on("offer", async (data) => {
      await handleOffer(data);
    });

    socket.on("answer", async (data) => {
      await handleAnswer(data);
    });

    socket.on("ice-candidate", async (data) => {
      await peers.current[data.from]?.addIceCandidate(data.candidate);
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, `${data.from}: ${data.message}`]);
    });

    socket.on("user-left", (userId) => {
      if (remoteVideos.current[userId]) {
        remoteVideos.current[userId].remove();
        delete remoteVideos.current[userId];
      }
      if (peers.current[userId]) {
        peers.current[userId].close();
        delete peers.current[userId];
      }
    });

    socket.on("stream-data", (data) => {
      streamChunks.current.push(data.chunk);
    });
  }, []);

  const joinRoom = async () => {
    setJoined(true);
    socket.emit("join-room", room);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp8"
    });

    mediaRecorder.current.ondataavailable = (e) => {
      socket.emit("stream-data", {
        room,
        chunk: new Uint8Array(await e.data.arrayBuffer())
      });
    };

    mediaRecorder.current.start(100);
  };

  const createPeer = (userId: string) => {
    const peer = new RTCPeerConnection();

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: userId,
          candidate: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      const video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;
      video.width = 300;
      video.srcObject = event.streams[0];

      remoteVideos.current[userId] = video;
      videoContainer.current?.appendChild(video);
    };

    const stream = localVideo.current?.srcObject as MediaStream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peers.current[userId] = peer;
  };

  const createOffer = async (userId: string) => {
    createPeer(userId);

    const offer = await peers.current[userId].createOffer();
    await peers.current[userId].setLocalDescription(offer);

    socket.emit("offer", {
      to: userId,
      sdp: offer
    });
  };

  const handleOffer = async (data: any) => {
    createPeer(data.from);

    await peers.current[data.from].setRemoteDescription(data.sdp);

    const answer = await peers.current[data.from].createAnswer();
    await peers.current[data.from].setLocalDescription(answer);

    socket.emit("answer", {
      to: data.from,
      sdp: answer
    });
  };

  const handleAnswer = async (data: any) => {
    await peers.current[data.from]?.setRemoteDescription(data.sdp);
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
          </div>

          <div
            ref={videoContainer}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              marginTop: 20
            }}
          ></div>

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

