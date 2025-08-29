import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['findernate-media.b-cdn.net', 'res.cloudinary.com', 'example.com', 'images.pexels.com', 'ui-avatars.com', 'cdn.pixabay.com', 'picsum.photos',"randomuser.me","images.unsplash.com","media.istockphoto.com","localhost","www.pexels.com" ],
  },
  eslint:{
    ignoreDuringBuilds: true,
  }
};

export default nextConfig; 