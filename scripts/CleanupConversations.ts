import { prisma } from "@/lib/prisma";

async function cleanup() {
  const conversations = await prisma.conversation.findMany({
    include: { members: true },
  });

  const invalid = conversations.filter((c) => {
    const ids = c.members.map((m) => m.userId);
    return ids.length !== 2 || new Set(ids).size !== 2;
  });

  for (const conv of invalid) {
    await prisma.conversation.delete({
      where: { id: conv.id },
    });
  }

  console.log(`Deleted ${invalid.length} invalid conversations`);
}

cleanup()
  .then(() => process.exit(0))
  .catch(console.error);
