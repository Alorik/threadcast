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

  /* ---------------------------
     Helper to send signaling via API
  --------------------------- */
  async function sendSignal(type: string, data: any) {
    try {
      console.log(
        "📤 Sending signal:",
        type,
        JSON.stringify(data).substring(0, 100)
      );
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

      const result = await response.json();
      console.log("✅ Signal sent successfully");
      return result;
    } catch (error) {
      console.error("❌ Failed to send signal:", error);
      throw error;
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

      console.log("✅ Local stream obtained:", {
        videoTracks: localStream.getVideoTracks().length,
        audioTracks: localStream.getAudioTracks().length,
      });

      setPermissionState("granted");
      return localStream;
    } catch (error: any) {
      console.error("❌ Media permission error:", error);
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
            setErrorMessage(`Error: ${error.message}`);
        }
      }
      return null;
    }
  }

  /* ---------------------------
     Setup media + peer
  --------------------------- */
  useEffect(() => {
    let mounted = true;

    async function init() {
      console.log("🎬 Initializing call...", { isCaller, conversationId });

      const localStream = await requestMediaPermissions();
      if (!localStream || !mounted) return;

      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        console.log("✅ Local video element set");
      }

      const pc = createPeerConnection(
        (remoteStream) => {
          console.log("🎥 Remote stream callback triggered");
          console.log("Remote stream tracks:", {
            video: remoteStream.getVideoTracks().length,
            audio: remoteStream.getAudioTracks().length,
          });

          if (!mounted) return;

          remoteStreamRef.current = remoteStream;

          if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            setHasRemoteVideo(true);
            console.log("✅ Remote video element set");
          }
        },
        (candidate) => {
          console.log(
            "🧊 Local ICE candidate:",
            candidate.candidate.substring(0, 50)
          );
          sendSignal("call:ice-candidate", candidate.toJSON());
        }
      );

      pc.onconnectionstatechange = () => {
        console.log("🔗 Connection state changed:", pc.connectionState);
        if (mounted) {
          setConnectionState(pc.connectionState);
        }
      };

      // Add all local tracks
      localStream.getTracks().forEach((track) => {
        console.log("➕ Adding local track:", track.kind, track.enabled);
        pc.addTrack(track, localStream);
      });

      pcRef.current = pc;
      if (isCaller && pc.signalingState === "stable") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal("call:offer", offer);
      } else {
        console.log("📞 I'm the receiver - waiting for offer...");
      }
    }

    init();

    return () => {
      mounted = false;
      console.log("🧹 Cleaning up call...");
      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      pcRef.current?.close();
      hasProcessedOfferRef.current = false;
      hasProcessedAnswerRef.current = false;
    };
  }, [conversationId, isCaller]);

  /* ---------------------------
     Signaling via Pusher
  --------------------------- */
  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    console.log("📡 Subscribing to Pusher channel:", channelName);

    const channel = pusherClient.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("✅ Pusher subscription successful");
    });

    channel.bind("pusher:subscription_error", (err: any) => {
      console.error("❌ Pusher subscription error:", err);
    });

    // Handle OFFER (receiver only)
    channel.bind("call:offer", async (payload: any) => {
      console.log("📥 [OFFER] Received:", payload);

      if (isCaller) {
        console.log("⏭️ Ignoring offer (I'm the caller)");
        return;
      }

      if (hasProcessedOfferRef.current) {
        console.log("⏭️ Already processed offer, ignoring duplicate");
        return;
      }

      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection available");
          return;
        }

        hasProcessedOfferRef.current = true;

        const offer = payload.data || payload;
        console.log("📝 Processing offer SDP:", offer.type);

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("✅ Remote description set (offer)");

        // Process queued ICE candidates
        if (iceCandidateQueueRef.current.length > 0) {
          console.log(
            `📦 Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`
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
        }

        const answer = await pc.createAnswer();
        console.log("📝 Answer created:", answer.type);

        await pc.setLocalDescription(answer);
        console.log("✅ Local description set (answer)");

        await sendSignal("call:answer", answer);
        console.log("✅ Answer sent");
      } catch (error) {
        console.error("❌ Failed to handle offer:", error);
        hasProcessedOfferRef.current = false;
      }
    });

    // Handle ANSWER (caller only)
    channel.bind("call:answer", async (payload: any) => {
      console.log("📥 [ANSWER] Received:", payload);

      if (!isCaller) {
        console.log("⏭️ Ignoring answer (I'm not the caller)");
        return;
      }

      if (hasProcessedAnswerRef.current) {
        console.log("⏭️ Already processed answer, ignoring duplicate");
        return;
      }

      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection available");
          return;
        }

        hasProcessedAnswerRef.current = true;

        const answer = payload.data || payload;
        console.log("📝 Processing answer SDP:", answer.type);

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description set (answer)");

        // Process queued ICE candidates
        if (iceCandidateQueueRef.current.length > 0) {
          console.log(
            `📦 Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`
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
        }
      } catch (error) {
        console.error("❌ Failed to handle answer:", error);
        hasProcessedAnswerRef.current = false;
      }
    });

    // Handle ICE CANDIDATES (both)
    channel.bind("call:ice-candidate", async (payload: any) => {
      console.log("📥 [ICE] Received candidate");

      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection available");
          return;
        }

        const candidate = payload.data || payload;

        if (!candidate || !candidate.candidate) {
          console.log("⏭️ Skipping empty candidate");
          return;
        }

        // Queue if remote description not set yet
        if (!pc.remoteDescription) {
          console.log("⏸️ Queueing ICE candidate (no remote description yet)");
          iceCandidateQueueRef.current.push(candidate);
          return;
        }

        console.log("🧊 Adding ICE candidate immediately");
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added successfully");
      } catch (error) {
        console.error("❌ Failed to add ICE candidate:", error);
      }
    });

    channel.bind("call:ended", () => {
      console.log("📴 Call ended by remote peer");
      handleEndCall();
    });

    return () => {
      console.log("🧹 Unsubscribing from Pusher");
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

    sendSignal("call:ended", {}).catch(console.error);

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
      {/* Connection Status */}
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
        className="absolute top-6 right-6 px-6 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg z-10"
      >
        End Call
      </button>
    </div>
  );
}
