import { authOptions } from "@/auth/config";
import FeedClient from "@/components/feed/FeedClient";
import ResponsiveSidebar from "@/components/navbar";
import { getServerSession } from "next-auth";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200">
      <ResponsiveSidebar />

      <main className="md:pl-72 min-h-screen">
        <div className="max-w-2xl mx-auto py-8 px-4 md:px-8">
          <FeedClient currentUserId={currentUserId} />
        </div>
      </main>
    </div>
  );
}
