// types/chat.ts
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: "TEXT" | "IMAGE";
  mediaUrl: string | null;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}
