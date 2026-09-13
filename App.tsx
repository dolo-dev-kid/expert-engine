// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import createAgoraRtcEngine, { RtcSurfaceView, ChannelProfileType } from 'react-native-agora';
import CallKeep from 'react-native-callkeep'; // Wraps CallKit & ConnectionService

const AGORA_APP_ID = 'YOUR_AGORA_APP_ID';

const callKeepOptions = {
  ios: { appName: 'CallApp' },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This app needs access to phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    selfManaged: true,
  },
};

export default function App() {
  const [engine, setEngine] = useState<any>(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    // 1. Initialize Native Call UI Keep
    CallKeep.setup(callKeepOptions);

    // 2. Initialize Real-Time Voice/Video Engine
    const rtcEngine = createAgoraRtcEngine();
    rtcEngine.initialize({ appId: AGORA_APP_ID });
    rtcEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
    rtcEngine.enableAudio();

    setEngine(rtcEngine);

    // 3. Register native call action listeners
    CallKeep.addEventListener('answerCall', ({ callUUID }) => {
      // Connect audio media upon answering
      joinRTCChannel('test-channel', 123456);
    });

    CallKeep.addEventListener('endCall', () => {
      rtcEngine.leaveChannel();
      setInCall(false);
    });

    return () => {
      rtcEngine.release();
    };
  }, []);

  const joinRTCChannel = async (channelName: string, uid: number) => {
    // Fetch token from Node.js server
    const response = await fetch('https://your-api.com/api/get-rtc-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, uid }),
    });
    const { token } = await response.json();

    engine.joinChannel(token, channelName, uid, {});
    setInCall(true);
  };

  const startOutgoingCall = (recipientNumber: string) => {
    const callUUID = '123e4567-e89b-12d3-a456-426614174000';
    CallKeep.startCall(callUUID, recipientNumber, recipientNumber);
    joinRTCChannel('test-channel', 123456);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Voice Call Status: {inCall ? 'In Call' : 'Idle'}</Text>
      <Button title="Call User" onPress={() => startOutgoingCall('+15550199')} />
    </View>
  );
}
