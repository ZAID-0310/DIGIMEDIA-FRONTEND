import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://digimedia-marketing.com";
const isStaging =
  process.env.APP_ENV === "staging" || siteUrl.includes("staging");

let robotsContent = "";

if (isStaging) {
  // Staging: Bloquear todos los bots y no exponer sitemap
  robotsContent = `User-agent: *
Disallow: /
`;
  console.log("🤖 robots.txt generado para STAGING (Disallow: /)");
} else {
  // Producción: Permitir rastreo y enlazar el sitemap oficial
  robotsContent = `User-agent: *
Allow: /

Sitemap: ${siteUrl.replace(/\/$/, "")}/sitemap.xml
`;
  console.log("🤖 robots.txt generado para PRODUCCIÓN (Allow: /)");
}

fs.writeFileSync(
  path.join(publicDir, "robots.txt"),
  robotsContent.trim() + "\n",
  "utf-8",
);
