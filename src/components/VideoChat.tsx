import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function VideoChat() {
  const [room, setRoom] = useState("global");
  const [joined, setJoined] = useState(false);

  const localVideo = useRef<HTMLVideoElement>(null);
  const peers = useRef<{ [id: string]: RTCPeerConnection }>({});
  const videoContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("existing-users", async (users) => {
      for (const userId of users) createOffer(userId);
    });

    socket.on("user-joined", async (userId) => {
      createOffer(userId);
    });

    socket.on("offer", async (data) => {
      handleOffer(data);
    });

    socket.on("answer", async (data) => {
      peers.current[data.from]?.setRemoteDescription(data.sdp);
    });

    socket.on("ice-candidate", async (data) => {
      peers.current[data.from]?.addIceCandidate(data.candidate);
    });
  }, []);

  const joinRoom = async () => {
    setJoined(true);
    socket.emit("join-room", room);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.current!.srcObject = stream;
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
      videoContainer.current?.appendChild(video);
    };

    const stream = localVideo.current!.srcObject as MediaStream;
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

  return (
    <div style={{ padding: 30, color: "white" }}>
      {!joined ? (
        <button
          onClick={joinRoom}
          style={{
            padding: "18px 40px",
            fontSize: 20,
            borderRadius: 12,
            background: "#00eaff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Join Video Room
        </button>
      ) : (
        <>
          <h2>Video Room: {room}</h2>

          <video ref={localVideo} autoPlay playsInline muted width={300} />

          <div
            ref={videoContainer}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              marginTop: 20
            }}
          ></div>
        </>
      )}
    </div>
  );
}
