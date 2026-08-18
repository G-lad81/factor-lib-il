import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { basePrefix, testServerHost, testServerPort } from './site-target';

const root = resolve(import.meta.dirname, '../dist');
const base = basePrefix;
const host = testServerHost;
const port = testServerPort;
const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);
    if (url.pathname !== base && !url.pathname.startsWith(`${base}/`)) {
      response.writeHead(404).end('Not found');
      return;
    }

    let pathname = decodeURIComponent(url.pathname.slice(base.length) || '/');
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${sep}`)) {
      response.writeHead(400).end('Invalid path');
      return;
    }

    const fileStats = await stat(file);
    if (!fileStats.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'content-type': contentTypes[extname(file)] ?? 'application/octet-stream',
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, host);
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
