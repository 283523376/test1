/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small (no node_modules at runtime).
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
