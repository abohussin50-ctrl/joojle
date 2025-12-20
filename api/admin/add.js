import { MeiliSearch } from "meilisearch";
import { verify } from "../../utils/auth.js"; // JWT Auth

const client = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_KEY
});

const index = client.index("pages");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // التحقق من صلاحية المستخدم
  try {
    verify(req);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { url } = JSON.parse(req.body);

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // إضافة الموقع كمستند أولي
    const doc = {
      id: url,
      url,
      title: "",
      content: "",
      images: [],
      videos: [],
      links: [],
      crawledAt: null
    };

    await index.addDocuments([doc]);

    return res.status(200).json({ success: true, message: "تم إضافة الموقع بنجاح" });
  } catch (err) {
    console.error("Error adding site:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
