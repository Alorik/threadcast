"use client";
import Image from "next/image";
import {
  Settings,
  Edit3,
  MapPin,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import FollowButton from "./follow-button";
import { useState } from "react";
import EditProfileModel from "./EditProfileModel";

interface ProfileCardProps {
  user: {
    id: string;
    username: string;
    name?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  };
  postCount: number;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  isOwnProfile?: boolean;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
}

// Helper function to get avatar or generate fallback
const getAvatarSrc = (
  avatarUrl: string | null | undefined,
  username: string
) => {
  if (avatarUrl) return avatarUrl;

  // Generate a consistent color based on username
  const hash = username.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const hue = Math.abs(hash) % 360;

  // Return a data URI with initials
  const initial = username.charAt(0).toUpperCase();
  const svg = `
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" fill="hsl(${hue}, 70%, 60%)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, sans-serif" font-size="60" font-weight="600" fill="white">
        ${initial}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function ProfileCard({
  user,
  postCount,
  avatarUrl,
  onAvatarClick,
  isOwnProfile,
  followerCount,
  followingCount,
  isFollowing = false,
  onFollowToggle,
}: ProfileCardProps) {
  const displayAvatarUrl = getAvatarSrc(
    avatarUrl || user.avatarUrl,
    user.username
  );

  const [editing, setEditing] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* Abstract Background Banner */}
      <div className="h-32 w-full rounded-t-2xl bg-neutral-900 relative overflow-hidden border border-neutral-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[60px] translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] -translate-x-10 translate-y-10" />
      </div>

      {/* Main Content Card */}
      <div className="relative -mt-1 px-6 pb-6 bg-neutral-950 border-x border-b border-neutral-800 rounded-b-2xl shadow-2xl">
        {/* Header: Avatar & Actions */}
        <div className="flex justify-between items-end -mt-12 mb-5">
          {/* Avatar with Glow */}
          <div className="relative">
            <div className="relative w-24 h-24 rounded-full p-1 bg-neutral-950 ring-4 ring-neutral-950">
              <div
                className={`relative w-full h-full rounded-full overflow-hidden ${
                  isOwnProfile ? "cursor-pointer" : ""
                }`}
              >
                <Image
                  key={avatarUrl || user.avatarUrl}
                  src={displayAvatarUrl}
                  alt={`${user.username}'s avatar`}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isOwnProfile ? "group-hover:opacity-75" : ""
                  }`}
                  onClick={isOwnProfile ? onAvatarClick : undefined}
                  priority
                  unoptimized={displayAvatarUrl.startsWith("data:")}
                />
                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <Edit3 className="text-white drop-shadow-md" size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-1">
            {isOwnProfile ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-1.5 bg-neutral-100 text-neutral-950 hover:bg-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Edit Profile
              </button>
            ) : (
              <FollowButton
                targetUserId={user.id}
                isFollowingInitial={!!isFollowing}
              />
            )}
            {isOwnProfile && (
              <button className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                <Settings size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-0.5">
              {user.name || user.username}
            </h1>
            <p className="text-neutral-500 font-mono text-xs">
              @{user.username}
            </p>
          </div>

          {/* Bio & Details */}
          {user.bio && (
            <p className="text-neutral-300 text-sm leading-relaxed max-w-lg">
              {user.bio}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium border-t border-neutral-900 pt-4">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-neutral-600" />
              <span>{user.location}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-px bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
            <StatBox label="Posts" value={postCount} />
            <StatBox label="Followers" value={followerCount} />
            <StatBox label="Following" value={followingCount} />
          </div>
        </div>
      </div>
      {editing && (
        <EditProfileModel
          initialName={user.name}
          initialBio={user.bio}
          initialLocation={user.location}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-neutral-950 hover:bg-neutral-900 transition-colors p-3 flex flex-col items-center justify-center cursor-default group">
    <span className="text-lg font-bold text-white mb-0.5 group-hover:text-indigo-400 transition-colors">
      {value}
    </span>
    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
      {label}
    </span>
  </div>
);
