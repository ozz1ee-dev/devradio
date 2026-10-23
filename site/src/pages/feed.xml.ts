import type { APIRoute } from "astro";

import { site } from "../config";
import { notes } from "../lib/news";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export const prerender = true;

export const GET: APIRoute = ({ site: origin }) => {
  const root = (origin ?? new URL(site.url)).toString().replace(/\/$/, "");
  const items = notes
    .map((note) => {
      const link = `${root}/#news`;
      return `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(`devradio-${note.id}`)}</guid>
      <pubDate>${escapeXml(new Date(`${note.date}T00:00:00Z`).toUTCString())}</pubDate>
      <category>station-note</category>
      <description>${escapeXml(note.body)} These notes describe the format. They are not a published archive.</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(`${root}/`)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${escapeXml(site.language)}</language>
    <lastBuildDate>${escapeXml(new Date("2026-10-23T00:00:00Z").toUTCString())}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
