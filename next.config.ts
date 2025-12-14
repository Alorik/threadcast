/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // ❌ REMOVE THIS - it's just a placeholder comment
      // {
      //   protocol: "https",
      //   hostname: "example.com",
      //   pathname: "/**",
      // },
    ],
  },
};

module.exports = nextConfig;
