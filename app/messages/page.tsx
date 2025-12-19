"use client";

import ChatSidebar from "@/components/chat/chat-sidebar";
import { MessageSquareDashed, Sparkles } from "lucide-react";

export default function MessagePage() {
  return (
    <div className="flex h-screen w-full bg-[#050505] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[120px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex w-full">
        {/* Sidebar Container */}
        <div className="w-80 lg:w-96 shrink-0 border-r border-white/5 bg-zinc-900/20 backdrop-blur-xl hidden md:block">
          <ChatSidebar />
        </div>

        {/* Main Content / Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          
          {/* Animated Empty State Icon */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm shadow-2xl transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
              <MessageSquareDashed size={64} className="text-slate-600 group-hover:text-indigo-400 transition-colors duration-300" strokeWidth={1} />
              
              <div className="absolute -top-2 -right-2 bg-indigo-500/20 p-2 rounded-full border border-indigo-500/30 backdrop-blur-md">
                <Sparkles size={16} className="text-indigo-300 animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Start a conversation</h2>
          <p className="text-slate-500 text-base max-w-sm text-center leading-relaxed">
            Choose a contact from the sidebar or start a new thread to begin messaging.
          </p>
          
          <button className="mt-10 px-8 py-3 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            New Message
          </button>
        </div>
      </div>
    </div>
  );
}