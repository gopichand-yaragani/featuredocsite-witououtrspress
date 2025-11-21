# SEO & GEO Care Guide (Plain-Language Playbook)

This guide explains how to keep the Virima docs search-friendly after the new SEO/GEO setup. It uses everyday language so anyone on the team can follow along, even without deep technical experience.

---

## 1. Why This Matters
Search engines (Google, Bing, etc.) need clear information about every page. Good SEO makes the docs easy to find. GEO settings (language, region) help search engines understand who the content is for.  

You now have automation that builds frontmatter (the short block at the top of each `.mdx` file), generates a sitemap, and publishes the latest `robots.txt`. Your job is to keep the content tidy and run the helper commands at the right times.

---

## 2. Tools You’ll Use
All commands are run from the project root (the `FeatureDocsite` folder).  

| Task | Command | When to Run |
| --- | --- | --- |
| Rebuild frontmatter everywhere | `npm run normalize:frontmatter` | After adding or editing many pages |
| Generate sitemap only | `npm run generate:sitemap` | After frontmatter changes (or before deployment) |
| Clean up accidental frontmatter (rare) | `npm run cleanup:frontmatter` | Only if the files picked up broken frontmatter and you need to start over |
| Full production build (includes sitemap) | `npm run build` | Before deploying |

Tip: The build command already regenerates the sitemap automatically, so you usually run `npm run build` before a release. Use `npm run generate:sitemap` alone when you only need the XML file updated quickly.

---

## 3. Adding a NEW Topic
1. **Create the `.mdx` file** in the correct folder. Add a quick draft frontmatter block (title & short description) if you can. Example:
   ```md
   ---
   title: "My New Topic"
   description: "Explain what the feature does in one sentence."
   ---
   ```
2. **Write the content** as usual.
3. **Run the normalizer** to polish the frontmatter and fill in the canonical URL and keywords automatically:
   ```bash
   npm run normalize:frontmatter
   ```
4. **Open the file** you just created and skim the frontmatter. Make sure the title/description still read correctly. Adjust wording if needed.
5. **Add the topic to navigation and routing** (sidebar, TOC, URL mapping) so the page is reachable.
6. **Run the build** when you’re ready to publish:
   ```bash
   npm run build
   ```
   (This regenerates the sitemap and checks for build errors.)
7. **Deploy** using your usual release steps (Git commit, push, GitHub Pages deploy, etc.).

---

## 4. Updating an EXISTING Topic
1. Edit the `.mdx` content. Keep the frontmatter at the top in place.
2. If you added new information that changes the summary, tweak the `description` line manually. Make sure it’s 1–2 short sentences, no HTML, no special characters.
3. Run the normalizer if you updated lots of pages:
   ```bash
   npm run normalize:frontmatter
   ```
   This keeps all topics consistent.
4. Build & deploy as usual.

---

## 5. Managing Canonical URLs and Indexing
- The canonical domain defaults to `https://docs.virima.com`. If you need to use a different host (for staging or a custom domain), set an environment variable before running the build:
  ```bash
  set VITE_CANONICAL_HOST=https://stage.docs.virima.com
  npm run build
  ```
- To block search engines on staging, set:
  ```bash
  set VITE_ALLOW_INDEXING=false
  npm run build
  ```
  This flips `<meta name="robots" content="noindex, nofollow">` across the site.

---

## 6. Publishing Checklist
Use this list every time you ship new docs:
1. Content reviewed and saved.
2. `npm run normalize:frontmatter` (optional but recommended if many files changed).
3. `npm run build` (sitemap refreshed automatically).
4. Commit & push changes (include `public/sitemap.xml` and `public/robots.txt`).
5. Deploy via GitHub Pages or your chosen method.

---

## 7. After Publishing: Quick Verification
Do these checks from a machine that can reach the live docs domain.

1. **Robots.txt**  
   ```bash
   curl -I https://docs.virima.com/robots.txt
   ```
   Expect `200 OK` and the body:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://docs.virima.com/sitemap.xml
   ```

2. **Sitemap**  
   ```bash
   curl -I https://docs.virima.com/sitemap.xml
   ```
   Make sure it returns `200 OK`. Optionally open it in a browser and spot-check a few URLs.

3. **Page Metadata**  
   Open one or two new pages in the browser. Use the browser’s “View Source” (or the Network tab) to confirm the `<title>`, `<meta name="description">`, and `<link rel="canonical">` look correct.

4. **Search Console**  
   In Google Search Console, submit the updated sitemap (`https://docs.virima.com/sitemap.xml`) so Google sees the new pages faster.

---

## 8. GEO / Language Notes
- Today we only ship English content. The HTML already announces `lang="en"` and Open Graph uses `og:locale=en_US`.
- If we add more languages later, the plan is to extend frontmatter with language codes and add `hreflang` links in the `<Seo>` component. For now, just keep English content tidy.

---

## 9. Troubleshooting
| Symptom | Fix |
| --- | --- |
| Frontmatter shows HTML tags in the title/keywords | Rerun `npm run normalize:frontmatter`, then tweak the manual title if still messy. |
| Duplicate or broken frontmatter | Run `npm run cleanup:frontmatter` then `npm run normalize:frontmatter`. |
| Sitemap still lists an old URL | Run `npm run generate:sitemap`, commit the updated `public/sitemap.xml`, rebuild, then redeploy. |
| Search engines indexing staging | Check the build environment: you may need `VITE_ALLOW_INDEXING=false`. |

---

## 10. Quick Reference Card
- Add/edit topic → run normalizer → build → deploy.
- Keep descriptions short (one or two sentences, no HTML).
- Always publish updated `public/robots.txt` and `public/sitemap.xml`.
- Verify live URLs with `curl` or browser after deployment.
- Submit the sitemap in Google Search Console for faster discovery.

With these steps, you’ll keep SEO and GEO healthy as the documentation grows—no special technical tricks required. Happy documenting!


