# Home page of Prof. Lior Rokach

A static, mobile-friendly academic home page (plain HTML, CSS and JavaScript; no build step).
It is ready to be hosted for free on GitHub Pages.

## Folder layout

```
index.html                 the page (all sections)
assets/css/style.css       design: colors, fonts, layout, light/dark themes
assets/js/main.js          theme switch, mobile menu, photo carousel, animated network, publication search
data/publications.js       publications (384 entries: in the CV and in Google Scholar; Scholar metadata)
assets/img/                carousel photos, book covers, patent images, talk thumbnails
.nojekyll                  tells GitHub Pages to serve the files as they are
```

## Publish on GitHub Pages (about 10 minutes)

1. Sign in to GitHub (or create a free account at https://github.com/signup).
2. Create a new **public** repository (the **+** menu at the top right, then **New repository**).
   - To get the address `https://USERNAME.github.io`, name the repository exactly `USERNAME.github.io`, where `USERNAME` is your GitHub user name.
   - Any other name, such as `homepage`, gives `https://USERNAME.github.io/homepage/`.
3. In the new repository click **Add file**, then **Upload files**.
   Unzip the archive on your computer and drag the **contents** of the folder (`index.html`, `assets`, `data`, `.nojekyll`, `README.md`) into the browser window, not the folder itself.
   On Windows, `.nojekyll` is a hidden file; if it does not upload, the site still works.
   Click **Commit changes**.
4. Open **Settings**, then **Pages** (left menu).
   Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, and click **Save**.
5. After one to two minutes the site is live at the address shown at the top of the **Pages** settings.

### Optional: send visitors from the old BGU address to the new site

Replace the content of the old `index.htm` on the BGU server with the snippet below (change the address).
Links printed in papers and in the CV will then open the new site.

```html
<!doctype html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=https://USERNAME.github.io/">
<link rel="canonical" href="https://USERNAME.github.io/">
<title>Lior Rokach</title>
<p>This page has moved to <a href="https://USERNAME.github.io/">https://USERNAME.github.io/</a>.</p>
```

### Optional: your own domain

To use an address such as `liorrokach.com`, enter it under **Settings → Pages → Custom domain** and follow GitHub's instructions for the DNS records.

## Keeping the site current

You can edit files directly on github.com (open a file and click the pencil icon). Each commit republishes the site within a minute or two.

| To change | Edit |
|---|---|
| News and highlights | `index.html`, the section `id="news"` (each item is one `<article class="news-item">`) |
| Counts in the hero (papers, graduates, patents) | `index.html`, the `stats` block in the hero |
| A new paper | `data/publications.js`: copy an entry and edit it |
| A new patent | `index.html`, section `id="patents"`: copy one `<a class="patent">` card, add its image to `assets/img/patents/`, and update the counts in the dark intro card |
| Carousel photos | `index.html`, the `<img class="slide">` list inside `id="slides"`; add files to `assets/img/carousel/`. Add the class `contain` for graphics that must not be cropped |
| Biography | `index.html`, the section `id="about"` |
| Students | `index.html`, the lists `id="phd-list"` and `id="msc-list"` |
| "Last updated" date | `index.html`, the footer |

A new publication entry looks like this:

```js
{"type": "journal", "year": 2026, "title": "Paper title", "authors": "A. Author, Lior Rokach", "venue": "Journal name, 12(3): 1-20", "url": "https://doi.org/..."},
```

`type` is one of `journal`, `conference`, `workshop`, `chapter`. If `url` is left out, the page links to a Google Scholar search for the title. An optional `"badge": "Best Paper, ..."` shows an award label.

## Notes

- The publication list contains only the papers that appear both in the CV (March 2026) and in the Google Scholar export. Authors, title, venue and year come from Google Scholar, with three exceptions: where Scholar cuts a title short, the full title from the CV is used; where Scholar's author list omits Lior Rokach, the CV's author list is used; and where Scholar gives no venue, the CV's venue is used. Books are listed in the Books section rather than in the publication list.
- The carousel photos, book covers (except the three newest), patent images and talk thumbnails were copied from the old home page at `ise.bgu.ac.il/faculty/liorr`. Images for the eight newest patents (2020–2023) are their main drawings from Google Patents.
- The page does not list an office room or phone number, because those on the old site predate the move to the new faculty. Add them in the Contact section if you want them public.
- The page works offline from the files alone; only the web fonts (Google Fonts) are loaded from the internet.
