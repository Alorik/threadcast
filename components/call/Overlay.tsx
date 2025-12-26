"use client";
import { useEffect, useRef } from "react";
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

  /* ---------------------------
     Helper to send signaling via API
  --------------------------- */
  async function sendSignal(event: string, data: any) {
    try {
      await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          event,
          data,
        }),
      });
    } catch (error) {
      console.error("Failed to send signal:", error);
    }
  }

  /* ---------------------------
     Setup media + peer
  --------------------------- */
  useEffect(() => {
    async function init() {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
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
      } catch (error) {
        console.error("Failed to initialize call:", error);
      }
    }

    init();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      pcRef.current?.close();
    };
  }, [conversationId, isCaller]);

  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );

    channel.bind("call:offer", async (offer: RTCSessionDescriptionInit) => {
      if (isCaller) return;
      try {
        const pc = pcRef.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal("call:answer", answer);
      } catch (error) {
        console.error("Failed to handle offer:", error);
      }
    });
    channel.bind("call:ice-candidate", async (candidate) => {
      try {
        await pcRef.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE add error", err);
      }
    });

    channel.bind("call:answer", async (answer: RTCSessionDescriptionInit) => {
      if (!isCaller) return;
      try {
        await pcRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Failed to handle answer:", error);
      }
    });

    channel.bind(
      "call:ice-candidate",
      async (candidate: RTCIceCandidateInit) => {
        try {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Failed to add ICE candidate:", error);
        }
      }
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId, isCaller]);

  /* ---------------------------
     UI
  --------------------------- */
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
    </div>
  );
}
