import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
};

module.exports = {
    images: {
        remotePatterns: [
            {
                hostname: 'img.clerk.com',
            }
        ]
    },
}

export default nextConfig;
