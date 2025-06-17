/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
      },
    });
    
    return config;
  },
  env: {
    N2YO_API_KEY: process.env.N2YO_API_KEY || '',
    N2YO_BASE_URL: 'https://api.n2yo.com/rest/v1/satellite',
  },
};

export default nextConfig;
