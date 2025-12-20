// api/search.js
import fetch from "node-fetch"; // إذا كنت تستخدم Node.js 24 على Vercel

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
  const API_KEY = process.env.AIzaSyAWecIJG2GxLJMDGtEC8kU7g0MHbBcV9S4;
  const CX = process.env.67b48004a78d943c5;

  if (!API_KEY || !CX) {
    return res.status(500).json({ error: "Google API key or CX is missing in environment variables" });
  }

  try {
    // استدعاء Google Custom Search API
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}`
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    // إرجاع النتائج فقط
    res.status(200).json(data.items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
