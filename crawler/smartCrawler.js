import { allowedByRobots } from "./utils/robots.js";
import axios from "axios";
import cheerio from "cheerio";
import { MeiliSearch } from "meilisearch";
import { extractLinks } from "./utils/links.js";
import { isSpam } from "./utils/spam.js";

const visited = new Set();

const client = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_KEY
});

const index = client.index("pages");

export async function crawlSite(url, depth) {
  if (visited.has(url) || depth <= 0) return;
  visited.add(url);
  if (!(await allowedByRobots(url))) {
  console.log("🚫 Blocked by robots.txt:", url);
  return;
}
  try {
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "joojle-bot/1.0" }
    });

    const $ = cheerio.load(data);

    const title = $("title").text().trim();
    const content = $("p").text().replace(/\s+/g, " ").slice(0, 8000);

    // فلترة السبام
    if (!title || isSpam(content)) return;

    const images = $("img")
      .map((i, e) => $(e).attr("src"))
      .get()
      .filter(Boolean);

    const videos = $("video source")
      .map((i, e) => $(e).attr("src"))
      .get()
      .filter(Boolean);

    const links = extractLinks($, url);

    await index.addDocuments([{
      id: url,
      url,
      title,
      content,
      images,
      videos,
      links,
      crawledAt: new Date().toISOString()
    }]);

    console.log("🕷️ Indexed:", url);

    // متابعة الروابط
    for (const link of links.slice(0, 5)) {
      await crawlSite(link, depth - 1);
    }

  } catch (err) {
    console.error("❌ Failed:", url);
  }
}
