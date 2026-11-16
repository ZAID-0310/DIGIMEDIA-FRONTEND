import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT_DIR = path.resolve("out");
const HTACCESS_PATH = path.join(OUT_DIR, ".htaccess");
const CSP_SCRIPTS_SUBDIR = "_next/static/csp";
const CSP_SCRIPTS_DIR = path.join(OUT_DIR, CSP_SCRIPTS_SUBDIR);

function getAllHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(
      '❌ No se encontró la carpeta out/. Ejecuta "next build" primero.',
    );
    process.exit(1);
  }

  fs.mkdirSync(CSP_SCRIPTS_DIR, { recursive: true });

  const htmlFiles = getAllHtmlFiles(OUT_DIR);
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let extractedCount = 0;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");

    const updatedHtml = html.replace(
      scriptRegex,
      (fullMatch, attrs, content) => {
        if (/\bsrc\s*=/i.test(attrs)) return fullMatch;

        const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
        if (typeMatch) {
          const mime = typeMatch[1].toLowerCase().trim();
          if (mime === "application/json" || mime === "application/ld+json") {
            return fullMatch;
          }
        }

        if (!content.trim()) return fullMatch;

        const hash = crypto
          .createHash("sha256")
          .update(content, "utf8")
          .digest("hex")
          .slice(0, 16);
        const fileName = `inline-${hash}.js`;
        const filePath = path.join(CSP_SCRIPTS_DIR, fileName);

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content, "utf8");
          extractedCount++;
        }

        // Quitar async/defer para mantener el orden síncrono exacto de ejecución
        const cleanAttrs = attrs
          .replace(/\b(async|defer)(\s*=\s*["'][^"']*["'])?/gi, "")
          .trim();
        const attrString = cleanAttrs ? ` ${cleanAttrs}` : "";
        return `<script src="/${CSP_SCRIPTS_SUBDIR}/${fileName}"${attrString}></script>`;
      },
    );

    if (updatedHtml !== html) {
      fs.writeFileSync(file, updatedHtml, "utf8");
    }
  }

  // Incluir 'strict-dynamic' junto con el hash del loader o los hashes de scripts inyectados dinámicamente
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'sha256-Fb7Qhav6w+sm+lUVq1XxGx343AFLQ9Taz6nRXuE3HM0=' https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://upload-widget.cloudinary.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss: ws: https://api.cloudinary.com https://*.cloudinary.com",
    "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google.com https://upload-widget.cloudinary.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.digimedia-marketing.com",
    "upgrade-insecure-requests;",
  ].join("; ");

  const cspLine = `  Header always set Content-Security-Policy "${cspHeader}"`;

  if (!fs.existsSync(HTACCESS_PATH)) {
    console.error("❌ No se encontró out/.htaccess.");
    process.exit(1);
  }

  let htaccess = fs.readFileSync(HTACCESS_PATH, "utf8");
  const cspRegex = /^[ \t]*Header always set Content-Security-Policy ".*"$/m;

  if (!cspRegex.test(htaccess)) {
    console.error(
      "⚠️ No se encontró la línea Content-Security-Policy en out/.htaccess.",
    );
    process.exit(1);
  }

  htaccess = htaccess.replace(cspRegex, cspLine);
  fs.writeFileSync(HTACCESS_PATH, htaccess, "utf8");

  console.log(
    `✅ Externalizados ${extractedCount} scripts inline en /${CSP_SCRIPTS_SUBDIR}/ (${htmlFiles.length} HTML procesados).`,
  );
  console.log(
    `✅ CSP estricta aplicada en out/.htaccess (~${Buffer.byteLength(cspLine)} bytes).`,
  );
}

main();
