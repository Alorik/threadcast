import Pusher from "pusher-js";

// Enable detailed logging in development to debug issues
if (process.env.NODE_ENV === "development") {
  Pusher.logToConsole = true;
}

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,

  // CRITICAL: Force TLS for secure WebSocket connections over HTTPS
  forceTLS: true,

  authEndpoint: "/api/pusher/auth",

  authTransport: "ajax",
  auth: {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  },

  // Enable both ws and wss transports
  enabledTransports: ["ws", "wss"],

  activityTimeout: 120000,
  pongTimeout: 30000,
});

pusherClient.connection.bind(
  "state_change",
  (states: { previous: string; current: string }) => {
    console.log(`🔄 Pusher: ${states.previous} → ${states.current}`);
  }
);

pusherClient.connection.bind("error", (err: any) => {
  console.error("❌ Pusher error:", err);
});

// Debug: Log successful connection
pusherClient.connection.bind("connected", () => {
  console.log(
    "✅ Pusher connected! Socket ID:",
    pusherClient.connection.socket_id
  );
});

export default pusherClient;
