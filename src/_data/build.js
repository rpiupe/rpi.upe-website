// Local calendar dates as YYYY-MM-DD strings, so templates compare them directly with dates from the YAML files.
const isoDay = (d) => d.toLocaleDateString("en-CA");
const yearAgo = new Date();
yearAgo.setDate(yearAgo.getDate() - 365);

export default { today: isoDay(new Date()), staleBefore: isoDay(yearAgo) };
