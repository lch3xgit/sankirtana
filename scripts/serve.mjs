import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8080);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

const server = http.createServer((request, response) => {
  let requestPath = decodeURIComponent(request.url.split("?")[0]);
  if (requestPath === "/" || requestPath === "") {
    requestPath = "/index.html";
  }

  const filePath = path.resolve(path.join(ROOT, requestPath));
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(data);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Sri Radha Digital Visual Sankirtana: http://localhost:${PORT}/`);
});
