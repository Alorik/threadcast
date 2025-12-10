export default function ProfileCard({
  user,
  postCount,
}: {
  user: {
    id: string;
    username: string;
    name?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  };
  postCount: number;
}) {
  return (
    <div className="border rounded-md p-4 flex items-center gap-6">
      {/* Avatar */}
      <img
        src={user.avatarUrl || "https://via.placeholder.com/120"}
        className="w-24 h-24 rounded-full object-cover"
      />

      {/* User Info */}
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
