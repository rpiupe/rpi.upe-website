import { load, CORE_SCHEMA } from "js-yaml";

const byDate = (a, b) => a.date.localeCompare(b.date);
const formatDate = (options) => (iso) => new Date(iso).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });

export default function (eleventyConfig) {
  // CORE_SCHEMA keeps dates as YYYY-MM-DD strings, so they compare as text and never shift by time zone.
  eleventyConfig.addDataExtension("yaml", (contents) => load(contents, { schema: CORE_SCHEMA }));
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("longDate", formatDate({ dateStyle: "long" }));
  eleventyConfig.addFilter("monthYear", formatDate({ month: "long", year: "numeric" }));
  eleventyConfig.addFilter("upcoming", (events, today) => events.filter((e) => e.date >= today).sort(byDate));
  eleventyConfig.addFilter("pastByYear", (events, today) => {
    const past = events.filter((e) => e.date < today).sort(byDate).reverse();
    return Object.entries(Object.groupBy(past, (e) => e.date.slice(0, 4))).sort(([a], [b]) => b.localeCompare(a));
  });
}

export const config = {
  dir: { input: "src", output: "_site" },
  pathPrefix: "/~upe/",
  htmlTemplateEngine: "njk",
};
