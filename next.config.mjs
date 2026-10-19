import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isStaging = process.env.APP_ENV === "staging";

  return {
    distDir: isDev ? ".next" : isStaging ? "out-staging" : "out",

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
    },
    compress: true,

    // Configuración para Turbopack (Next.js 16+)
    turbopack: {
      resolveAlias: {
        // Redirige el polyfill al módulo vacío equivalente
        "next/dist/build/polyfills/polyfill-module": path.join(
          __dirname,
          "scripts",
          "empty-polyfill.js",
        ),
      },
    },

    // Mantenido como respaldo en caso de compilar con el flag --webpack
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
