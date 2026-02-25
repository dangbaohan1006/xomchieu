import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org', // Dành cho phim/TV (TMDB)
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl', // Dành cho ảnh truyện (MangaDex Proxy)
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // Dành cho ảnh Anime (Consumet/AniList)
      },
      // Nếu sau này Anime có trả về domain khác (như gogocdn, v.v.), bạn cứ thêm vào đây
    ],
  },
};

export default nextConfig;