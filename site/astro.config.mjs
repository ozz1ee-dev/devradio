import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Canonical origin for devradio.co.uk. public/CNAME is copied into the Pages
// artifact so the custom domain already configured on the repository stays
// attached to the next deploy.
export default defineConfig({
  site: "https://devradio.co.uk",
  base: "/",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      filter(page) {
        return !page.includes("feed.xml");
      },
    }),
  ],
});
