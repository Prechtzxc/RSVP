import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.join(process.cwd(), "out");
const port = Number(process.env.QA_PORT ?? 3001);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ics": "text/calendar; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const requestedPath = path.resolve(root, `.${pathname}`);
  if (!requestedPath.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  let filePath = requestedPath;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
  if (!existsSync(filePath)) filePath = path.join(root, "404.html");

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(filePath.endsWith("404.html") ? 404 : 200, {
    "Content-Type": contentTypes[extension] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Static QA server ready at http://localhost:${port}`);
});
