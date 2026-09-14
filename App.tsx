// App.tsx
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const roomId = 'test-room';
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('offer', async ({ from, offer }) => {
      if (!pcRef.current) pcRef.current = new RTCPeerConnection();
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer });
    });

    socket.on('answer', async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(answer);
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(candidate);
    });
  }, []);

  return <div>P2P test app</div>;
}

export default App;
