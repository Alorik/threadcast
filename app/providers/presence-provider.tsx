"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";

type PresenceContextType = {
  onlineUsers: Set<string>;
};

const PresenceContext = createContext<PresenceContextType | null>(null);

export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Subscribe to presence channel
    const channel = pusherClient.subscribe("presence-global");

    // When subscription succeeds, get all current members
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      const memberIds = new Set<string>();
      members.each((member: any) => {
        memberIds.add(member.id);
      });
      setOnlineUsers(memberIds);
      console.log("Initial online users:", Array.from(memberIds));
    });

    // When a new member joins
    channel.bind("pusher:member_added", (member: any) => {
      console.log("User came online:", member.id);
      setOnlineUsers((prev) => new Set(prev).add(member.id));
    });

    // When a member leaves
    channel.bind("pusher:member_removed", (member: any) => {
      console.log("User went offline:", member.id);
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("presence-global");
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("usePresence must be used inside PresenceProvider");
  return ctx;
}
