import { crawlSite } from "./smartCrawler.js";

const SITES = [
  "https://example.com",
  "https://ar.wikipedia.org"
];

(async () => {
  for (const site of SITES) {
    await crawlSite(site, 2);
  }
  console.log("⏱️ Scheduled crawl done");
})();
