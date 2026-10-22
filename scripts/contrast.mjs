// Checks the WCAG contrast ratio of every color pair the site uses. Colors come from :root in site.css.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/assets/site.css", import.meta.url), "utf8");
const colors = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]));

const lum = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// [where it is used, foreground token, background token, minimum ratio]. Text needs 4.5, borders and focus rings need 3.
const pairs = [
  ["body text", "ink", "paper", 4.5],
  ["secondary text", "muted", "paper", 4.5],
  ["link / accent", "red", "paper", 4.5],
  ["link hover", "red-dark", "paper", 4.5],
  ["button text", "paper", "red", 4.5],
  ["button hover text", "paper", "red-dark", 4.5],
  ["gold label", "gold", "paper", 4.5],
  ["notice text", "ink", "notice", 4.5],
  ["notice secondary", "muted", "notice", 4.5],
  ["notice link", "red-dark", "notice", 4.5],
  ["placeholder text", "muted", "placeholder", 4.5],
  ["footer text", "footer-text", "ink", 4.5],
  ["footer secondary", "footer-muted", "ink", 4.5],
  ["footer gold", "gold-light", "ink", 4.5],
  ["focus ring on white", "ink", "paper", 3],
  ["focus ring on footer", "gold-light", "ink", 3],
  ["card border (UI)", "muted", "paper", 3],
  ["placeholder border (UI)", "muted", "placeholder", 3],
];

let failed = 0;
for (const [name, fg, bg, need] of pairs) {
  for (const token of [fg, bg]) {
    if (!colors[token]) { console.error(`FAIL ${name}: no --${token} in site.css`); failed++; }
  }
  if (!colors[fg] || !colors[bg]) continue;
  const r = ratio(colors[fg], colors[bg]);
  if (r < need) { console.error(`FAIL ${name}: --${fg} on --${bg} is ${r.toFixed(2)}:1, needs ${need}:1`); failed++; }
}
if (failed) process.exit(1);
console.log(`Contrast OK (${pairs.length} pairs).`);
