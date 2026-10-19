const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const robotsPath = path.join(publicDir, "robots.txt");

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://digimedia-marketing.com"
).replace(/\/\$/, "");

const isStaging =
  process.env.APP_ENV === "staging" || siteUrl.includes("staging");

let robotsContent = "";

if (isStaging) {
  // Staging: Bloqueo absoluto para cualquier bot
  robotsContent = `User-agent: *
Disallow: /
`;
  console.log("🤖 robots.txt sobrescrito para STAGING (Disallow: /)");
} else {
  // Producción: Reglas completas con sitemap
  robotsContent = `User-agent: *
Allow: /
Allow: /_next/
Allow: /public/

# Bloquear rutas privadas y administrativas
Disallow: /dashboard*
Disallow: /login*
Disallow: /api/
Disallow: /admin/

# Bloquear archivos y carpetas sensibles / codigo fuente
Disallow: /*.env$
Disallow: /.env*
Disallow: /.git/
Disallow: /node_modules/
Disallow: /src/

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;
  console.log("🤖 robots.txt sobrescrito para PRODUCCIÓN");
}

fs.writeFileSync(robotsPath, robotsContent.trim() + "\n", "utf-8");
