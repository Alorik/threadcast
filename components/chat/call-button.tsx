"use client"

import { VideoIcon } from "lucide-react";


export default function CallButton({ conversationId }: { conversationId: string }) {

  async function startCall() {
    fetch("/api/call/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        type: "call:incoming",
      }),
    });
  }

   return (
     <button
       onClick={startCall}
       className="p-2 rounded-full hover:bg-white/10 transition"
     >
       <VideoIcon size={18} />
     </button>
   );
  
}

