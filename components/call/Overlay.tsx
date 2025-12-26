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
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  const [permissionState, setPermissionState] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("new");

  /* ---------------------------
     Helper to send signaling via API
  --------------------------- */
  async function sendSignal(type: string, data: any) {
    try {
      console.log("📤 Sending signal:", type, data);
      const response = await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type,
          data,
        }),
      });
      const result = await response.json();
      console.log("✅ Signal sent:", result);
    } catch (error) {
      console.error("❌ Failed to send signal:", error);
    }
  }

  /* ---------------------------
     Request Media Permissions
  --------------------------- */
  async function requestMediaPermissions() {
    try {
      setErrorMessage("");

      if (!window.isSecureContext) {
        setErrorMessage(
          "Camera/Microphone access requires a secure connection (HTTPS).\n\n" +
            "You're currently using HTTP. Please:\n" +
            "1. Use HTTPS, OR\n" +
            "2. Access via localhost for development\n\n" +
            `Current URL: ${window.location.href}`
        );
        setPermissionState("denied");
        return null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage(
          "Your browser doesn't support camera/microphone access.\n\n" +
            "Please use Chrome, Edge, Firefox, or Safari."
        );
        setPermissionState("denied");
        return null;
      }

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setPermissionState("granted");
      return localStream;
    } catch (error) {
      console.error("Failed to get media permissions:", error);
      setPermissionState("denied");

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            setErrorMessage(
              "Camera/Microphone access denied. Please allow permissions and try again."
            );
            break;
          case "NotFoundError":
            setErrorMessage(
              "No camera or microphone found. Please connect a device."
            );
            break;
          case "NotReadableError":
            setErrorMessage(
              "Camera/microphone is in use by another application."
            );
            break;
          default:
            setErrorMessage(`Error: ${error.message || "Unknown error"}`);
        }
      }
      return null;
    }
  }

  /* ---------------------------
     Setup media + peer
  --------------------------- */
  useEffect(() => {
    async function init() {
      console.log("🎬 Initializing call...", { isCaller });

      const localStream = await requestMediaPermissions();
      if (!localStream) return;

      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const pc = createPeerConnection(
        (remoteStream) => {
          console.log("🎥 Remote stream received!", remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setHasRemoteVideo(true);
          }
        },
        (candidate) => {
          console.log("🧊 Sending ICE candidate:", candidate);
          sendSignal("call:ice-candidate", candidate.toJSON());
        }
      );

      // Add connection state logging
      pc.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE connection state:", pc.iceConnectionState);
      };

      localStream.getTracks().forEach((track) => {
        console.log("➕ Adding local track:", track.kind);
        pc.addTrack(track, localStream);
      });

      pcRef.current = pc;

      if (isCaller) {
        console.log("📞 Creating offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("📤 Sending offer:", offer);
        await sendSignal("call:offer", offer);
      }
    }

    init();

    return () => {
      console.log("🧹 Cleaning up call...");
      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      pcRef.current?.close();
    };
  }, [conversationId, isCaller]);

  /* ---------------------------
     Signaling
  --------------------------- */
  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    console.log("📡 Subscribing to:", channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("✅ Subscribed to:", channelName);
    });

    channel.bind("call:offer", async (payload: any) => {
      console.log("📥 Received offer payload:", payload);

      if (isCaller) {
        console.log("⏭️ Ignoring offer (I'm the caller)");
        return;
      }

      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection");
          return;
        }

        // Extract the actual offer from the payload
        const offer = payload.data || payload;
        console.log("📝 Processing offer:", offer);

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("✅ Remote description set (offer)");

        // Process queued ICE candidates
        console.log(
          `📦 Processing ${iceCandidateQueueRef.current.length} queued candidates`
        );
        for (const candidate of iceCandidateQueueRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ Added queued ICE candidate");
          } catch (err) {
            console.error("❌ Failed to add queued candidate:", err);
          }
        }
        iceCandidateQueueRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("📤 Sending answer:", answer);
        await sendSignal("call:answer", answer);
      } catch (error) {
        console.error("❌ Failed to handle offer:", error);
      }
    });

    channel.bind("call:answer", async (payload: any) => {
      console.log("📥 Received answer payload:", payload);

      if (!isCaller) {
        console.log("⏭️ Ignoring answer (I'm not the caller)");
        return;
      }

      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection");
          return;
        }

        // Extract the actual answer from the payload
        const answer = payload.data || payload;
        console.log("📝 Processing answer:", answer);

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description set (answer)");

        // Process queued ICE candidates
        console.log(
          `📦 Processing ${iceCandidateQueueRef.current.length} queued candidates`
        );
        for (const candidate of iceCandidateQueueRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ Added queued ICE candidate");
          } catch (err) {
            console.error("❌ Failed to add queued candidate:", err);
          }
        }
        iceCandidateQueueRef.current = [];
      } catch (error) {
        console.error("❌ Failed to handle answer:", error);
      }
    });

    channel.bind("call:ice-candidate", async (payload: any) => {
      console.log("📥 Received ICE candidate payload:", payload);

      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection");
          return;
        }

        // Extract the actual candidate from the payload
        const candidate = payload.data || payload;

        if (!candidate || !candidate.candidate) {
          console.log("⏭️ Skipping empty candidate");
          return;
        }

        console.log("🧊 Processing ICE candidate:", candidate);

        // Queue if remote description not set
        if (!pc.remoteDescription) {
          console.log("⏸️ Queuing candidate (no remote description yet)");
          iceCandidateQueueRef.current.push(candidate);
          return;
        }

        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added");
      } catch (error) {
        console.error("❌ Failed to add ICE candidate:", error);
      }
    });

    channel.bind("call:ended", () => {
      console.log("📴 Call ended by remote user");
      handleEndCall();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId, isCaller]);

  /* ---------------------------
     End Call Handler
  --------------------------- */
  const handleEndCall = () => {
    console.log("🛑 Ending call...");

    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    pcRef.current?.close();

    sendSignal("call:ended", {});

    if (onEndCall) {
      onEndCall();
    } else {
      window.location.reload();
    }
  };

  /* ---------------------------
     UI
  --------------------------- */
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
              onClick={() => {
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
      {/* Connection Status Indicator */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
        {connectionState === "connected" ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            {connectionState === "connecting"
              ? "Connecting..."
              : connectionState}
          </span>
        )}
      </div>

      {/* Remote Video */}
      <div className="flex-1 relative">
        {hasRemoteVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
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
            </div>
          </div>
        )}
      </div>

      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-6 right-6 w-48 h-36 rounded-xl border-2 border-white/20 object-cover scale-x-[-1] shadow-2xl"
      />

      {/* End Call Button */}
      <button
        onClick={handleEndCall}
        className="absolute top-6 right-6 px-6 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg"
      >
        End Call
      </button>
    </div>
  );
}
