// app/chat/[conversationId]/page.tsx
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

  const isMember = conversation.members.some(
    (m) => m.userId === session.user.id
  );

  if (!isMember) {
    return <div>Unauthorized</div>;
  }

  const otherUser = conversation.members.find(
    (m) => m.userId !== session.user.id
  )?.user;

  if (!otherUser) {
    return <div>User not found</div>;
  }

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

  const messages = messagesFromDb.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    content: msg.content || "",
    type: msg.type,
    mediaUrl: msg.mediaUrl,
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    createdAt: msg.createdAt.toISOString(),
    sender: msg.sender,
  }));

  return (
    <div className="max-w-6xl mx-auto p-4 z-50">
      <ChatLayout
        conversationId={conversationId}
        otherUser={otherUser}
        initialMessages={messages}
        currentUserId={session.user.id}
      />
    </div>
  );
}
