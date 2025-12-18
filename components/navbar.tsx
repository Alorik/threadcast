"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Settings,
  LogOut,
  Command,
  Plus,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "search", label: "Explore", icon: Search, href: "/explore" },
  {
    id: "notifications",
    label: "Activity",
    icon: Bell,
    badge: 3,
    href: "/activity",
  },
  { id: "messages", label: "Messages", icon: Mail, href: "/messages" },
  { id: "profile", label: "Profile", icon: User },
  { id: "create", label: "Create", icon: Plus, href: "/post" },
];

export default function ResponsiveSidebar() {
  const { data: session } = useSession();
  const username = session?.user?.username;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const handleNavigation = (item: any) => {
    setActiveTab(item.id);

    if (item.id === "profile") {
      if (!username) return;
      router.push(`/u/${username}`);
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };
  return (
    <>
      {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl px-4 py-6">
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-4 mb-10">
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">
              ThreadCast
            </h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className="relative w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group"
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav-desktop"
                  className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 ${
                  activeTab === item.id
                    ? "text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                <item.icon size={22} />
              </div>

              <span
                className={`relative z-10 font-medium text-sm ${
                  activeTab === item.id
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.label}
              </span>

              {item.badge && (
                <span className="relative z-10 ml-auto h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings size={22} />
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut size={22} />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR (Hidden on desktop) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-20 pb-4 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 px-6 flex items-center justify-between">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className="relative flex flex-col items-center justify-center w-full h-full gap-1 pt-2 group"
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="active-nav-mobile"
                className="absolute top-0 h-1 w-12 bg-indigo-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <div
              className={`relative transition-transform duration-300 ${
                activeTab === item.id
                  ? "-translate-y-1"
                  : "group-active:scale-90"
              }`}
            >
              <item.icon
                size={24}
                className={`transition-colors duration-300 ${
                  activeTab === item.id
                    ? "text-indigo-400 fill-indigo-400/20"
                    : "text-slate-500"
                }`}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-[#0f1115]" />
              )}
            </div>

            <span
              className={`text-[10px] font-medium transition-colors duration-300 ${
                activeTab === item.id ? "text-indigo-100" : "text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
