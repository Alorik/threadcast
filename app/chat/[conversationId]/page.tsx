import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import ChatMessage from "@/components/chat/chat-message";

export default async function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Please login</div>;
  }

  const { conversationId } = params;

  // 1️⃣ Fetch message history
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-lg font-semibold mb-4">Chat</h1>

      {/* 2️⃣ Realtime messages */}
      <ChatMessage conversationId={conversationId} initialMessages={messages} />
    </div>
  );
}
