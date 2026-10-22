// Prints WCAG contrast ratios for every color pair the stylesheet uses. Keep in sync with :root in src/assets/site.css.
const lum = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const pairs = [
  ["body text", "#1b1b1f", "#ffffff", 4.5],
  ["secondary text", "#54585a", "#ffffff", 4.5],
  ["link / accent", "#d6001c", "#ffffff", 4.5],
  ["link hover", "#ab2328", "#ffffff", 4.5],
  ["button text", "#ffffff", "#d6001c", 4.5],
  ["button hover text", "#ffffff", "#ab2328", 4.5],
  ["gold label", "#8a6d1e", "#ffffff", 4.5],
  ["notice text", "#1b1b1f", "#f7f3e8", 4.5],
  ["notice secondary", "#54585a", "#f7f3e8", 4.5],
  ["notice link", "#ab2328", "#f7f3e8", 4.5],
  ["placeholder text", "#54585a", "#f4f4f5", 4.5],
  ["footer text", "#f2f2f2", "#1b1b1f", 4.5],
  ["footer secondary", "#c9cbcc", "#1b1b1f", 4.5],
  ["footer gold", "#d9b65b", "#1b1b1f", 4.5],
  ["focus ring on white", "#1b1b1f", "#ffffff", 3],
  ["focus ring on footer", "#d9b65b", "#1b1b1f", 3],
  ["card border (UI)", "#54585a", "#ffffff", 3],
  ["placeholder border (UI)", "#54585a", "#f4f4f5", 3],
];

let failed = 0;
console.log("| Pair | Foreground | Background | Ratio | Needs | Result |\n|---|---|---|---|---|---|");
for (const [name, fg, bg, need] of pairs) {
  const r = ratio(fg, bg);
  if (r < need) failed++;
  console.log(`| ${name} | ${fg} | ${bg} | ${r.toFixed(2)}:1 | ${need}:1 | ${r >= need ? "pass" : "FAIL"} |`);
}
process.exit(failed ? 1 : 0);
