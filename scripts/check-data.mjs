import { existsSync, readFileSync } from "node:fs";
import { load, CORE_SCHEMA } from "js-yaml";
import build from "../src/_data/build.js";

const dataDir = new URL("../src/_data/", import.meta.url);
const photoDir = new URL("../src/assets/img/photos/", import.meta.url);

const schema = {
  chapter: { keys: ["name", "short_name", "tagline", "institution", "email", "meeting", "social", "documents", "verified"] },
  officers: { keys: ["verified", "officers"], list: "officers", item: ["greek", "title", "name", "description"] },
  committees: { keys: ["verified", "committees"], list: "committees", item: ["name", "chair", "description"] },
  events: { keys: ["events"], list: "events", item: ["date", "title", "description"] },
  membership: { keys: ["term", "application_url", "deadline", "requirements", "national_requirements_url", "verified"] },
  tutoring: { keys: ["form_url", "rate", "response_time", "verified"] },
  awards: { keys: ["verified", "ingalls"], list: "ingalls", item: ["year", "name"] },
  photos: { keys: ["photos"], list: "photos", item: ["file", "width", "height", "alt", "caption", "alt_needs_review"] },
};

const errors = [];
const warnings = [];
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s);

function checkDates(value, where) {
  if (value === null || typeof value !== "object") return;
  for (const [key, v] of Object.entries(value)) {
    const at = `${where}.${key}`;
    if (key === "deadline" && v === null) continue;
    if (["date", "verified", "deadline"].includes(key)) {
      if (!isDate(v)) errors.push(`${at}: "${v}" is not a valid date. Use YYYY-MM-DD.`);
      else if (key === "verified" && v < build.staleBefore) warnings.push(`${at} is ${v}, more than a year ago. The site shows a "Last confirmed" notice.`);
    }
    checkDates(v, at);
  }
}

for (const [name, { keys, list, item }] of Object.entries(schema)) {
  const file = `src/_data/${name}.yaml`;
  const data = load(readFileSync(new URL(`${name}.yaml`, dataDir), "utf8"), { schema: CORE_SCHEMA }) ?? {};
  for (const key of keys) {
    if (!(key in data)) errors.push(`${file}: missing required key "${key}".`);
  }
  if (list) {
    for (const [i, entry] of (data[list] ?? []).entries()) {
      for (const key of item) {
        if (!(key in entry)) errors.push(`${file}: ${list}[${i}] is missing "${key}".`);
      }
    }
  }
  checkDates(data, file);
  if (name === "chapter") {
    for (const key of ["when", "where", "verified"]) {
      if (!(key in (data.meeting ?? {}))) errors.push(`${file}: meeting is missing "${key}".`);
    }
  }
  if (name === "photos") {
    const photos = data.photos ?? [];
    for (const [i, p] of photos.entries()) {
      if (typeof p.alt !== "string" || !p.alt.trim()) errors.push(`${file}: photos[${i}] (${p.file}) needs alt text that describes the photo.`);
      if (!existsSync(new URL(String(p.file), photoDir))) errors.push(`${file}: photos[${i}] file src/assets/img/photos/${p.file} does not exist.`);
    }
    const unreviewed = photos.filter((p) => p.alt_needs_review === true).length;
    if (unreviewed) warnings.push(`${file}: ${unreviewed} photo${unreviewed === 1 ? " has" : "s have"} alt text nobody has reviewed yet. Set alt_needs_review to false once someone who was there has read it.`);
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
if (errors.length) process.exit(1);
console.log(`Data OK (${warnings.length} warning${warnings.length === 1 ? "" : "s"}).`);
