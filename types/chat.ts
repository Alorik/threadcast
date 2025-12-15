export type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};
