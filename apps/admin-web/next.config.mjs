/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['undici'],
  output: 'export',
  images: { unoptimized: true }
};
export default nextConfig;
