"use client";
import { useEffect, useRef, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { createPeerConnection } from "@/lib/webrtc";

interface CallOverlayProps {
  conversationId: string;
  isCaller: boolean;
}

export default function CallOverlay({
  conversationId,
  isCaller,
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [permissionState, setPermissionState] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");

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

      // Check if running in secure context
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

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage(
          "Your browser doesn't support camera/microphone access.\n\n" +
            "Please use:\n" +
            "• Chrome (version 53+)\n" +
            "• Edge (version 79+)\n" +
            "• Firefox (version 36+)\n" +
            "• Safari (version 11+)"
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

      // If video fails, try audio only
      if (error instanceof DOMException && error.name === "NotReadableError") {
        try {
          console.log("⚠️ Camera busy, trying audio only...");
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setPermissionState("granted");
          setErrorMessage("Camera is in use. Audio-only mode enabled.");
          return audioStream;
        } catch (audioError) {
          console.error("Audio-only also failed:", audioError);
        }
      }

      setPermissionState("denied");

      // Provide specific error messages
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            setErrorMessage(
              "Camera/Microphone access denied. Please:\n\n" +
                "1. Click the camera icon in your browser's address bar\n" +
                "2. Allow camera and microphone access\n" +
                "3. On Windows 11: Go to Settings > Privacy & Security > Camera/Microphone and enable access\n" +
                "4. Reload this page"
            );
            break;
          case "NotFoundError":
            setErrorMessage(
              "No camera or microphone found on your device. Please connect a camera/microphone and try again."
            );
            break;
          case "NotReadableError":
            setErrorMessage(
              "Camera or microphone is already in use by another application. Please close other apps using the camera/mic and try again."
            );
            break;
          case "OverconstrainedError":
            setErrorMessage(
              "Your camera or microphone doesn't meet the requirements. Try using different hardware."
            );
            break;
          default:
            setErrorMessage(
              `Error accessing media devices: ${
                error.message || "Unknown error"
              }`
            );
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }

      return null;
    }
  }

  /* ---------------------------
     Setup media + peer
  --------------------------- */
  useEffect(() => {
    async function init() {
      const localStream = await requestMediaPermissions();

      if (!localStream) {
        return;
      }

      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const pc = createPeerConnection(
        (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        },
        (candidate) => {
          sendSignal("call:ice-candidate", candidate.toJSON());
        }
      );

      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      pcRef.current = pc;

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal("call:offer", offer);
      }
    }

    init();

    return () => {
      console.log("🧹 Cleaning up call...");
      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      pcRef.current?.close();
      console.log("✅ Cleanup complete");
    };
  }, [conversationId, isCaller]);

  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );

    console.log(
      "📡 Subscribed to channel:",
      `private-conversation-${conversationId}`
    );

    channel.bind("call:offer", async (data: any) => {
      console.log("📥 Received offer:", data);
      if (isCaller) {
        console.log("⏭️ Skipping offer (I'm the caller)");
        return;
      }
      try {
        const pc = pcRef.current;
        if (!pc) {
          console.error("❌ No peer connection");
          return;
        }

        const offer = data.data || data;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal("call:answer", answer);
        console.log("✅ Answer sent");
      } catch (error) {
        console.error("❌ Failed to handle offer:", error);
      }
    });

    channel.bind("call:answer", async (data: any) => {
      console.log("📥 Received answer:", data);
      if (!isCaller) {
        console.log("⏭️ Skipping answer (I'm not the caller)");
        return;
      }
      try {
        const answer = data.data || data;
        await pcRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("✅ Answer processed");
      } catch (error) {
        console.error("❌ Failed to handle answer:", error);
      }
    });

    channel.bind("call:ice-candidate", async (data: any) => {
      console.log("📥 Received ICE candidate:", data);
      try {
        const candidate = data.data || data;
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added");
      } catch (error) {
        console.error("❌ Failed to add ICE candidate:", error);
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId, isCaller]);

  /* ---------------------------
     UI
  --------------------------- */

  // Show permission request screen
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
    <div className="fixed inset-0 z-[999] bg-black flex ">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="flex-1 object-cover"
      />
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-6 right-6 w-40 h-28 rounded-xl border border-white/20 object-cover scale-x-[-1]"
      />

      {/* End Call Button */}
      <button
        onClick={() => {
          // Stop all tracks
          localStreamRef.current?.getTracks().forEach((track) => {
            track.stop();
            console.log("🛑 Stopped track:", track.kind);
          });

          // Close peer connection
          pcRef.current?.close();

          // Send end call signal
          sendSignal("call:ended", {});

          // Close the overlay (you'll need to pass this from parent)
          window.location.reload(); // Temporary solution
        }}
        className="absolute top-6 right-6 px-6 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
      >
        End Call
      </button>
    </div>
  );
}
