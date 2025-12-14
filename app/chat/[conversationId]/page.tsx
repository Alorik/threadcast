import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import ChatMessage from "@/components/chat/chat-message";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Please login</div>;
  }

  const { conversationId } = await params;

  // 1️⃣ Fetch message history
  const messagesFromDb = await prisma.message.findMany({
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

  // ✅ Convert Date objects to ISO strings
  const messages = messagesFromDb.map((msg) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(), // Date → string
    sender: {
      id: msg.sender.id,
      username: msg.sender.username,
      avatarUrl: msg.sender.avatarUrl,
    },
  }));

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-lg font-semibold mb-4">Chat</h1>

      {/* 2️⃣ Realtime messages */}
      <ChatMessage conversationId={conversationId} initialMessages={messages} />
    </div>
  );
}
