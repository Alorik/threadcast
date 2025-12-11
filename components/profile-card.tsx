// components/profile-card.tsx
export default function ProfileCard({
  user,
  postCount,
  avatarUrl,
  onAvatarClick,
  isOwnProfile,
}: {
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
}) {
  return (
    <div className="border rounded-md p-4 flex items-center gap-6">
      <div className="relative">
        <img
          key={avatarUrl} // Force re-render when avatar changes
          src={avatarUrl || user.avatarUrl || "https://via.placeholder.com/120"}
          alt={`${user.username}'s avatar`}
          className={`w-24 h-24 rounded-full object-cover ${
            isOwnProfile ? "cursor-pointer hover:opacity-70 transition" : ""
          }`}
          onClick={isOwnProfile ? onAvatarClick : undefined}
        />

        {/* Show "Change" badge on hover */}
        {isOwnProfile && (
          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none">
            Change
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{user.username}</h1>

        {user.name && <p className="text-sm text-gray-700">{user.name}</p>}
        {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}

        <div className="flex gap-4 text-sm mt-2">
          <span>
            <strong>{postCount}</strong> Posts
          </span>
          <span>
            <strong>0</strong> Followers
          </span>
          <span>
            <strong>0</strong> Following
          </span>
        </div>
      </div>
    </div>
  );
}
