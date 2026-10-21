import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
    },
    ...(isDev ? {} : { output: "export" }),
    trailingSlash: true,
    experimental: {
      optimizePackageImports: [
        "@radix-ui/react-*",
        "lucide-react",
        "@marsidev/react-turnstile",
      ],
      clientRouterFilter: false,
    },
    compress: true,

    turbopack: {
      resolveAlias: {
        "next/dist/build/polyfills/polyfill-module": path.join(
          __dirname,
          "scripts",
          "empty-polyfill.js",
        ),
      },
    },

    webpack: (config, { dev, webpack }) => {
      if (!dev) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /build[\\/]polyfills[\\/]polyfill-module/,
            path.join(__dirname, "scripts", "empty-polyfill.js"),
          ),
        );
      }
      return config;
    },
  };
};
