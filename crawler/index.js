import { crawlSite } from "./smartCrawler.js";

// رابط البداية
const START_URL = "https://example.com";

// عمق الزحف (2 = يتبع الروابط مرتين)
const DEPTH = 2;

crawlSite(START_URL, DEPTH)
  .then(() => console.log("✅ Crawler finished"))
  .catch(err => console.error("❌ Crawler error:", err));
