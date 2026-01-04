"use client";
import { useEffect, useRef, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { createPeerConnection } from "@/lib/webrtc";

interface CallOverlayProps {
  conversationId: string;
  isCaller: boolean;
  onEndCall?: () => void;
}

export default function CallOverlay({
  conversationId,
  isCaller,
  onEndCall,
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const hasProcessedOfferRef = useRef(false);
  const hasProcessedAnswerRef = useRef(false);

  const [permissionState, setPermissionState] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMicMuted(!audioTrack.enabled);
  };

  async function sendSignal(
    type: string,
    data:
      | RTCSessionDescriptionInit
      | RTCIceCandidateInit
      | Record<string, never>
  ): Promise<void> {
    try {
      const response = await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await response.json();
    } catch (error) {
      throw error;
    }
  }

  async function requestMediaPermissions(): Promise<MediaStream | null> {
    try {
      setErrorMessage("");

      if (!window.isSecureContext) {
        setErrorMessage(
          "Camera/Microphone requires HTTPS or localhost.\n" +
            `Current: ${window.location.href}`
        );
        setPermissionState("denied");
        return null;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage("Browser doesn't support camera/microphone.");
        setPermissionState("denied");
        return null;
      }

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      setPermissionState("granted");
      return localStream;
    } catch (error) {
      setPermissionState("denied");

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            setErrorMessage(
              "Permission denied. Please allow camera/microphone access."
            );
            break;
          case "NotFoundError":
            setErrorMessage("No camera or microphone found.");
            break;
          case "NotReadableError":
            setErrorMessage("Camera/microphone is in use by another app.");
            break;
          default:
            setErrorMessage(
              `Error: ${error.message || "Unknown error occurred"}`
            );
        }
      }
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function init(): Promise<void> {
      const localStream = await requestMediaPermissions();
      if (!localStream || !mounted) return;

      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const pc = createPeerConnection(
        (remoteStream: MediaStream) => {
          if (!mounted) return;

          remoteStreamRef.current = remoteStream;

          if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            setHasRemoteVideo(true);
          }
        },
        (candidate: RTCIceCandidate) => {
          sendSignal("call:ice-candidate", candidate.toJSON());
        }
      );

      pc.onconnectionstatechange = (): void => {
        if (mounted) {
          setConnectionState(pc.connectionState);
        }
      };

      localStream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, localStream);
      });

      pcRef.current = pc;

      if (isCaller && pc.signalingState === "stable") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal("call:offer", offer);
      }
    }

    init();

    return (): void => {
      mounted = false;
      localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      pcRef.current?.close();
      hasProcessedOfferRef.current = false;
      hasProcessedAnswerRef.current = false;
    };
  }, [conversationId, isCaller]);

  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind(
      "call:offer",
      async (
        payload: {
          data?: RTCSessionDescriptionInit;
        } & RTCSessionDescriptionInit
      ): Promise<void> => {
        if (isCaller || hasProcessedOfferRef.current) return;

        try {
          const pc = pcRef.current;
          if (!pc) return;

          hasProcessedOfferRef.current = true;

          const offer = payload.data || payload;
          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          if (iceCandidateQueueRef.current.length > 0) {
            for (const candidate of iceCandidateQueueRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                // Silent fail
              }
            }
            iceCandidateQueueRef.current = [];
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal("call:answer", answer);
        } catch (error) {
          hasProcessedOfferRef.current = false;
        }
      }
    );

    channel.bind(
      "call:answer",
      async (
        payload: {
          data?: RTCSessionDescriptionInit;
        } & RTCSessionDescriptionInit
      ): Promise<void> => {
        if (!isCaller || hasProcessedAnswerRef.current) return;

        try {
          const pc = pcRef.current;
          if (!pc) return;

          hasProcessedAnswerRef.current = true;

          const answer = payload.data || payload;
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          if (iceCandidateQueueRef.current.length > 0) {
            for (const candidate of iceCandidateQueueRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                // Silent fail
              }
            }
            iceCandidateQueueRef.current = [];
          }
        } catch (error) {
          hasProcessedAnswerRef.current = false;
        }
      }
    );

    channel.bind(
      "call:ice-candidate",
      async (
        payload: {
          data?: RTCIceCandidateInit;
          candidate?: string;
        } & RTCIceCandidateInit
      ): Promise<void> => {
        try {
          const pc = pcRef.current;
          if (!pc) return;

          const candidate = payload.data || payload;

          if (!candidate || !candidate.candidate) return;

          if (!pc.remoteDescription) {
            iceCandidateQueueRef.current.push(candidate);
            return;
          }

          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          // Silent fail
        }
      }
    );

    channel.bind("call:ended", (): void => {
      handleEndCall();
    });

    return (): void => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId, isCaller]);

  const handleEndCall = (): void => {
    localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });

    pcRef.current?.close();

    sendSignal("call:ended", {}).catch(() => {
      // Silent fail
    });

    if (onEndCall) {
      onEndCall();
    } else {
      window.location.reload();
    }
  };

  if (permissionState === "pending" || permissionState === "denied") {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
        <div className="bg-[#16181d] p-8 rounded-2xl max-w-md space-y-4">
          <h2 className="text-white font-semibold text-xl">
            {permissionState === "pending"
              ? "Requesting Permissions..."
              : "Permission Denied"}
          </h2>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm whitespace-pre-line">
                {errorMessage}
              </p>
            </div>
          )}

          {permissionState === "denied" && (
            <button
              onClick={(): void => {
                setPermissionState("pending");
                requestMediaPermissions();
              }}
              className="w-full px-4 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col">
      {/* Connection Status - Top Left */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs z-10">
        {connectionState === "connected" ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Connected
          </span>
        ) : connectionState === "connecting" ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            {connectionState}
          </span>
        )}
      </div>

      {/* Remote Video */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-800 to-gray-900">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${
            hasRemoteVideo ? "opacity-100" : "opacity-0"
          }`}
        />

        {!hasRemoteVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-white text-lg">Waiting for video...</p>
              <p className="text-gray-400 text-sm">{connectionState}</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video - Top Right */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute top-6 right-6 w-48 h-36 rounded-xl border-2 border-white/20 object-cover scale-x-[-1] shadow-2xl z-10"
      />

      {/* Control Buttons - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        {/* Mic Button */}
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition shadow-lg ${
            isMicMuted
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white/20 hover:bg-white/30"
          }`}
          title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMicMuted ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            )}
          </svg>
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition shadow-lg"
          title="End Call"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
            />
          </svg>
        </button>

        {/* Camera Button */}
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition shadow-lg ${
            isCameraOff
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white/20 hover:bg-white/30"
          }`}
          title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCameraOff ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
