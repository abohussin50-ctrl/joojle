// /api/search.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  if (!API_KEY || !CX) {
    return res.status(500).json({ error: "Google API key or CX is missing" });
  }

  try {
    // تم إضافة searchType=image لتخصيص البحث للصور فقط
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}&searchType=image&num=10`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();

    // تنسيق النتائج لتناسب بيانات الصور
    const results = (data.items || []).map(item => ({
      title: item.title || "",
      link: item.link || "",             // رابط الصورة المباشر
      displayLink: item.displayLink || "", // الموقع المصدر
      snippet: item.snippet || "",
      thumbnail: item.image?.thumbnailLink || "", // الصورة المصغرة
      context: item.image?.contextLink || ""      // صفحة الويب التي تحتوي الصورة
    }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
