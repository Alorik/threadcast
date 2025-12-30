import Pusher from "pusher-js";

// Enable detailed logging in development to debug issues
if (process.env.NODE_ENV === "development") {
  Pusher.logToConsole = true;
}

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,

  // CRITICAL: Force TLS for secure WebSocket connections over HTTPS
  forceTLS: true,

  // Authorization endpoint for private/presence channels
  authEndpoint: "/api/pusher/auth",

  // Ensure proper content type for auth requests
  authTransport: "ajax",
  auth: {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  },

  // Enable both ws and wss transports
  enabledTransports: ["ws", "wss"],

  // Connection timeouts
  activityTimeout: 120000,
  pongTimeout: 30000,
});

// Debug: Log connection state changes
pusherClient.connection.bind(
  "state_change",
  (states: { previous: string; current: string }) => {
    console.log(`🔄 Pusher: ${states.previous} → ${states.current}`);
  }
);

// Debug: Log errors
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
