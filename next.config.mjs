/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Strip console.* from the PRODUCTION bundle (keep console.error), while
    // leaving all logs intact during `next dev`. No code changes needed —
    // every console.log stays in source and still prints locally.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
