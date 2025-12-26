export function createPeerConnection(
  onTrack: (stream: MediaStream) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void
): RTCPeerConnection {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

  // Track all received streams
  const remoteStream = new MediaStream();

  pc.ontrack = (event) => {
    console.log("🎥 Track received:", event.track.kind, event.streams.length);

    // Add track to remote stream
    event.track.onunmute = () => {
      console.log("🔊 Track unmuted:", event.track.kind);
    };

    remoteStream.addTrack(event.track);

    // Call the callback with the stream
    onTrack(remoteStream);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("🧊 ICE candidate generated:", event.candidate.candidate);
      onIceCandidate(event.candidate);
    } else {
      console.log("🧊 ICE gathering complete");
    }
  };

  pc.onconnectionstatechange = () => {
    console.log("🔗 Connection state:", pc.connectionState);
  };

  pc.oniceconnectionstatechange = () => {
    console.log("🧊 ICE connection state:", pc.iceConnectionState);
  };

  pc.onsignalingstatechange = () => {
    console.log("📡 Signaling state:", pc.signalingState);
  };

  return pc;
}
