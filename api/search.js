import fetch from "node-fetch"; // Node.js 24 على Vercel

export default async function handler(req, res) {
  // دعم GET فقط
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  // جلب مفتاح API و CX من المتغيرات البيئية
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  if (!API_KEY || !CX) {
    return res.status(500).json({ error: "Google API key or CX is missing in environment variables" });
  }

  try {
    // استدعاء Google Custom Search API
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}&num=10`
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();

    // تحويل النتائج لتحتوي فقط على title, link, snippet
    const results = (data.items || []).map(item => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || ""
    }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
