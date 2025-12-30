"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Pusher, { PresenceChannel } from "pusher-js";

type PresenceContextType = {
  onlineUsers: Set<string>;
};

interface PusherMembers {
  count: number;
  myID: string;
  me: PusherMember;
  members: Record<string, PusherMember>;
  each(callback: (member: PusherMember) => void): void;
}

interface PusherMember {
  id: string;
  info?: any;
}

const PresenceContext = createContext<PresenceContextType | null>(null);

export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.error("Pusher configuration missing");
      return;
    }

    const client = new Pusher(key, {
      cluster: cluster,
      authEndpoint: "/api/pusher/auth",
    });

    setPusherClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(
      "presence-global"
    ) as PresenceChannel;

    channel.bind("pusher:subscription_succeeded", (members: PusherMembers) => {
      const memberIds = new Set<string>();
      members.each((member: PusherMember) => {
        memberIds.add(member.id);
      });
      setOnlineUsers(memberIds);
      console.log("Initial online users:", Array.from(memberIds));
    });

    channel.bind("pusher:member_added", (member: PusherMember) => {
      console.log("User came online:", member.id);
      setOnlineUsers((prev) => new Set(prev).add(member.id));
    });

    channel.bind("pusher:member_removed", (member: PusherMember) => {
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
  }, [pusherClient]);

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
