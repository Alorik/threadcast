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

  /* ---------------------------
     Setup media + peer
  --------------------------- */
  useEffect(() => {
    async function init() {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const pc = createPeerConnection((remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      pcRef.current = pc;

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        pusherClient.trigger(
          `private-conversation-${conversationId}`,
          "call:offer",
          offer
        );
      }
    }

    init();
  }, [conversationId, isCaller]);

  /* ---------------------------
     Signaling
  --------------------------- */
  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );

    channel.bind("call:offer", async (offer) => {
      if (isCaller) return;

      const pc = pcRef.current!;
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      pusherClient.trigger(
        `private-conversation-${conversationId}`,
        "call:answer",
        answer
      );
    });

    channel.bind("call:answer", async (answer) => {
      if (!isCaller) return;
      await pcRef.current?.setRemoteDescription(answer);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId, isCaller]);

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div className="fixed inset-0 z-[999] bg-black flex">
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
        className="absolute bottom-6 right-6 w-40 h-28 rounded-xl border border-white/20 object-cover"
      />
    </div>
  );
}
