import { authOptions } from "@/auth/config";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ResponsiveSidebar from "@/components/navbar";
import FeedClient from "@/components/feed/FeedClient";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 selection:bg-rose-500/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>
      <div className="relative z-10">
        {/* Navigation Rail */}
        <ResponsiveSidebar />
        {/* Main Content */}
        <main className="md:pl-72 min-h-screen">
          <div className="max-w-2xl mx-auto py-8 px-4 md:px-8">
            <FeedClient />
          </div>
        </main>
      </div>
    </div>
  );
}
