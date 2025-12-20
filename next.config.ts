import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
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
  
  // Optimize image loading with remote patterns
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artfulsheets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
