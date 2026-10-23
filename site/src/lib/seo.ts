import { site } from "../config";

/** One canonical form: https origin, no query, no hash, no duplicate slashes. */
export function canonicalUrl(pathname: string): string {
  const url = new URL(pathname || "/", site.url);
  url.search = "";
  url.hash = "";
  const collapsed = url.pathname.replace(/\/{2,}/g, "/");
  url.pathname = collapsed === "" ? "/" : collapsed;
  return url.href;
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${site.url}/`).href;
}

export function structuredData() {
  const url = canonicalUrl("/");
  const logo = absoluteUrl(site.logoPath);
  const description = site.seoDescription;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: site.name,
        url,
        description,
        inLanguage: site.language,
        publisher: { "@id": `${url}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        name: site.name,
        url,
        description,
        logo,
      },
      {
        "@type": "RadioStation",
        "@id": `${url}#station`,
        name: site.name,
        url,
        description,
        inLanguage: site.language,
        logo,
      },
    ],
  };
}
