export type Message = {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  readAt: string | null;

  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};
