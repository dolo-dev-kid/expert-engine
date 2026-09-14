import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function App() {
  const roomId = "test-room";
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!joined) return;

    pcRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    // Send ICE candidates
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // Receive remote stream
    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Get camera/mic
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream);
        });
      });

    // Signaling events
    socket.on("user-joined", async () => {
      const offer = await pcRef.current!.createOffer();
      await pcRef.current!.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer });
    });

    socket.on("offer", async ({ offer }) => {
      await pcRef.current!.setRemoteDescription(offer);
      const answer = await pcRef.current!.createAnswer();
      await pcRef.current!.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await pcRef.current!.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pcRef.current!.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE error", err);
      }
    });

  }, [joined]);

  const joinRoom = () => {
    socket.emit("join-room", roomId);
    setJoined(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>P2P Video Test</h1>

      {!joined && (
        <button onClick={joinRoom}>Join Room</button>
      )}

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>
          <h3>Your Video</h3>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 300 }} />
        </div>

        <div>
          <h3>Remote Video</h3>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300 }} />
        </div>
      </div>
    </div>
  );
}
