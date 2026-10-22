// Calendar dates in the chapter's time zone as YYYY-MM-DD strings, so templates compare them directly with dates from the YAML files.
const isoDay = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
};
const yearAgo = new Date();
yearAgo.setDate(yearAgo.getDate() - 365);

export default { today: isoDay(new Date()), staleBefore: isoDay(yearAgo) };
