// Run after `bun run build`. Every internal href/src must carry the /~upe/ prefix and resolve to a file in _site.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const site = new URL("../_site/", import.meta.url).pathname;
const prefix = "/~upe/";
const pages = readdirSync(site, { recursive: true }).filter((f) => f.endsWith(".html"));
const failures = [];
let checked = 0;

for (const page of pages) {
  const html = readFileSync(join(site, page), "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https:|mailto:)/.test(url)) continue;
    checked++;
    if (url.startsWith("#")) {
      if (!ids.has(url.slice(1))) failures.push(`${page}: ${url} has no matching id`);
      continue;
    }
    if (!url.startsWith(prefix)) { failures.push(`${page}: ${url} does not start with ${prefix}`); continue; }
    const path = url.slice(prefix.length).split("#")[0];
    const file = join(site, path.endsWith("/") || path === "" ? join(path, "index.html") : path);
    if (!existsSync(file)) failures.push(`${page}: ${url} does not resolve (looked for ${file.slice(site.length)})`);
  }
}

console.log(`${pages.length} pages, ${checked} internal links and images checked.`);
for (const f of failures) console.error(`FAIL ${f}`);
process.exit(failures.length ? 1 : 0);
