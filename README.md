# UPE at RPI website

## What this is

This is the website of the Rensselaer chapter of Upsilon Pi Epsilon (UPE). It is a static site built with [Eleventy](https://www.11ty.dev/). The site is served at `https://www.cs.rpi.edu/~upe/`, and `upe.cs.rpi.edu` redirects there.

All chapter facts live in YAML files in `src/_data/`. To update the site, edit one file and rebuild. You do not need to edit HTML for routine changes.

The site has no JavaScript, no web fonts, and no requests to other servers. You need no special tools or paid services to maintain it. A laptop with Node.js and git is enough.

## Make a semester update, step by step

This is the whole routine for a new webmaster. It takes about fifteen minutes.

1. Install [Node.js](https://nodejs.org/) 22 or later if you do not have it. It comes with `npm`. Check with `node --version`.
2. Clone the repository and install the two build tools:

   ```sh
   git clone <repository url> upe-site
   cd upe-site
   npm install
   ```

3. Make a branch for your change, for example `git switch -c fall-2027-officers`.
4. Edit the data files. The table in the next section says which file and field to change. Open the file in any text editor.
5. Preview your change:

   ```sh
   npm run serve
   ```

   Open `http://localhost:8080/~upe/` in a browser. The page reloads when you save a file. Press Ctrl+C to stop.
6. Build and check:

   ```sh
   npm run build
   ```

   This checks the data files, builds the site into `_site/`, and checks every internal link. If it prints an error, see "If a command fails" below.
7. Commit and push your branch, then open a pull request so another officer can look at it.
8. Deploy the `_site/` folder to the server. See "Deploy" below.

## Update the site

| To change | Edit file | Field |
|---|---|---|
| Officer names | `src/_data/officers.yaml` | `name` on each officer, then `verified` |
| Committee chairs | `src/_data/committees.yaml` | `chair` on each committee, then `verified` |
| Add or remove a committee | `src/_data/committees.yaml` | a `committees` entry (`name`, `chair`, `description`) |
| Meeting time or room | `src/_data/chapter.yaml` | `meeting.when`, `meeting.where`, `meeting.verified` |
| Chapter contact email | `src/_data/chapter.yaml` | `email` |
| Social media links | `src/_data/chapter.yaml` | `social` |
| Constitution or by-laws link | `src/_data/chapter.yaml` | `documents` |
| Open a membership application | `src/_data/membership.yaml` | `term`, `application_url`, `deadline`, `verified` |
| Membership requirements | `src/_data/membership.yaml` | `requirements` |
| Add an event | `src/_data/events.yaml` | a new entry at the top of `events` |
| Tutoring form, rate, or reply time | `src/_data/tutoring.yaml` | `form_url`, `rate`, `response_time`, `verified` |
| Ingalls award recipients | `src/_data/awards.yaml` | an `ingalls` entry (`year`, `name`), then `verified` |
| Add a photo | `src/_data/photos.yaml` and `src/assets/img/photos/` | a `photos` entry (`file`, `width`, `height`, `alt`, `caption`, `year`, `alt_needs_review`) |

Some notes:

- Write dates as `YYYY-MM-DD`.
- Set a name or chair to `null` when you do not know it. The page shows "To be announced".
- `verified` is the date someone last confirmed the facts in that file. When it is more than a year old, the page shows a "Last confirmed" notice. Update it whenever you check the file, even if nothing changed.
- The site decides on each build which events are upcoming and whether the membership application is open. Nobody has to move events or toggle a flag. Rebuild and deploy after the date passes so the live site catches up.
- Mark I/O talks with `kind: io`.
- Resize a photo before you add it, so the long edge is at most 1600 pixels and the file is under about 300 KB. Any image editor can do this. On a Mac, run `sips -Z 1600 -s format jpeg -s formatOptions 75 in.jpg --out src/assets/img/photos/out.jpg`, and get the size for `width` and `height` with `sips -g pixelWidth -g pixelHeight out.jpg`. On other systems, read the size from the image's file properties.

## Change the words or the layout

Page text that is not in a data file lives in the templates in `src/`. Each page is one file, for example `src/about.njk`. A template is ordinary HTML with [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) tags such as `{{ chapter.name }}` for a value from a data file and `{% for %}` for a loop. The shared header and footer are in `src/_includes/base.njk`, and the small reusable pieces (the "To be announced" placeholder, the stale-data notice, an event card) are in `src/_includes/macros.njk`.

The stylesheet is one file, `src/assets/site.css`. The colors are named once at the top of it.

## Commands

```sh
npm install     # once, after cloning
npm run serve   # preview at http://localhost:8080/~upe/
npm run build   # check the data, build into _site/, then check every internal link
npm run check   # check the data files only
```

`npm run check` fails with a clear message when a required field is missing, a date is not valid, a photo has no alt text or no file, or the application link is not `https`. It warns when a `verified` date is more than a year old.

If you change a color in `src/assets/site.css`, update the same pair in `scripts/contrast.mjs` and run `node scripts/contrast.mjs`. Every pair must pass.

## If a command fails

- `error: src/_data/....yaml: missing required key "..."` or `is missing "..."`. A data entry lost a field. Every entry in a list needs every field, even if the value is `null`.
- `error: ... is not a valid date`. Write the date as `YYYY-MM-DD` with the quotes left off, for example `2027-09-14`.
- `error: ... needs alt text`. Fill in `alt` for the photo. Describe what the photo shows.
- `error: ... file ... does not exist`. The `file` name in `photos.yaml` does not match a file in `src/assets/img/photos/`. Check spelling and case.
- `FAIL page: url does not resolve`. A link in a template points to a page or image that does not exist. This cannot come from a data file edit alone.
- A YAML parse error with a line number. Look at that line for a missing colon, a mismatched indent, or a value with a colon in it. Wrap such a value in double quotes.
- `npm: command not found` or `node: command not found`. Node.js is not installed or not on your PATH. Install it from nodejs.org and open a new terminal.

## Deploy

The built `_site/` folder is copied to the CS web root that serves `www.cs.rpi.edu/~upe/`. Confirm the exact copy method with the current webmaster. A typical command looks like this:

```sh
npm run build
rsync -av --delete _site/ USER@HOST:~/public_html/
```

Replace `USER@HOST` and the target folder with the real values. `--delete` removes files from the server that are not in `_site/`, so check the target folder first.

Apache serves `404.html` for missing pages only if the web root has an `.htaccess` file with `ErrorDocument 404 /~upe/404.html`. Ask the webmaster whether `.htaccess` overrides are allowed.

## Accessibility checklist for any content change

The site follows the Rensselaer Web Accessibility Standards policy, which requires WCAG 2.0 Level AA. The site targets WCAG 2.2 AA.

- Give every new photo `alt` text that says what the photo shows. Do not start with "Image of".
- Keep headings in order. Each page has one `h1`, then `h2`, then `h3`.
- Write link text that makes sense on its own. Do not use "click here" or "here". Say when a link opens a Google Form.
- Do not convey information with color alone.
- Keep the link to the Rensselaer Statement of Accessibility in the footer.
- Run `npm run check`, then `npm run build`.

## What changed from the old site

- The site is now built from data files. Officers, events, and the membership status no longer need HTML edits.
- Events move to the archive automatically after their date. The membership call to action closes automatically after the deadline.
- Old events and the I/O talk list are merged into one events page. Links to dead sites (`npcompete.io`, `aicomp.io`, closed forms, and PDF applications) are removed.
- Photos are resized, have alt text, and load lazily. The originals totaled 32 MB.
- Committee descriptions are rewritten in plain, gender-neutral language. The Rules committee, which the old site had hidden, is not listed.
- jQuery, Bootstrap, tooltips, and the photo carousel are gone. The site uses no JavaScript.
- These pages were dropped on purpose:
  - Projects. The list dated from about 2012.
  - Portfolios. The member names were out of date.
  - Minutes. The page was empty.
  - PDF and PowerPoint attachments, including old paper applications, the resume book, and I/O slides.
