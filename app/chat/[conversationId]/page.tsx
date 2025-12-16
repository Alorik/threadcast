import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import ChatLayout from "@/components/chat/chat-Layout";


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

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    return <div>Conversation not found</div>;
  }


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

  //other user
  const otherUser = conversation.members.find(
    (m) => m.user.id !== session.user.id
  )?.user;

  if (!otherUser) {
    return <div>User not found</div>;
  }


  return (
    <div className="max-w-6xl mx-auto p-4">
      <ChatLayout
        otherUser={otherUser}
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={session.user.id}
      />
      {/* 2️⃣ Realtime messages */}
    </div>
  );
}
