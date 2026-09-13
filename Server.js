// server.js
import express from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token'; // Example using Agora SFU
import { WebSocketServer } from 'ws';

const app = express();
app.use(express.json());

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Generate secure RTC token for client media stream
app.post('/api/get-rtc-token', (req, res) => {
  const { channelName, uid } = req.body;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return res.json({ token, channelName, uid });
});

const server = app.listen(5000, () => console.log('Server running on port 5000'));

// WebSocket Signaling for Call Initiation
const wss = new WebSocketServer({ server });
const connectedClients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'REGISTER') {
      connectedClients.set(data.userId, ws);
    } 
    
    // Relay call invite to target recipient
    if (data.type === 'INVITE_CALL') {
      const recipientWs = connectedClients.get(data.recipientId);
      if (recipientWs) {
        recipientWs.send(JSON.stringify({
          type: 'INCOMING_CALL',
          callerId: data.callerId,
          channelName: data.channelName,
        }));
      } else {
        // Fallback: Trigger VoIP Push Notification (APNs/FCM)
        triggerPushNotification(data.recipientId, data.callerId, data.channelName);
      }
    }
  });
});
