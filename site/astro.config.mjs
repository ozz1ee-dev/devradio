import { defineConfig } from "astro/config";

// Canonical origin once devradio.co.uk points here.
// Do not add site/public/CNAME in this change. A CNAME file inside the Pages
// artifact sets the repository's custom domain on the next deploy.
export default defineConfig({
  site: "https://devradio.co.uk",
  base: "/",
});
