import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  // Disable source maps in development to avoid parsing errors
  productionBrowserSourceMaps: false,
  
  // Optimize compilation speed
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable source maps in development for faster compilation
      config.devtool = false;
      
      // Reduce chunk size calculations
      config.performance = {
        hints: false,
      };
      
      // Enable caching for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Optimize module resolution
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    
    return config;
  },
  
  // Reduce initial compile time
  swcMinify: true,
  
  // Optimize image loading
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
