export function createPeerConnection(onTrack: (stream: mediaStream) => void) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
  });

  pc.ontrack = (event) => {
    onTrack(event.streams[0]);
  };

  return pc;
}
