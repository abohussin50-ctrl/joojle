// /api/search.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // دعم GET فقط
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  // استلام معامل start من الرابط، وإذا لم يوجد نفترض أنه 1 (البداية)
  const start = req.query.start || 1;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  if (!API_KEY || !CX) {
    return res.status(500).json({ error: "Google API key or CX is missing" });
  }

  try {
    // تم إضافة &start=${start} لتمكين نظام الصفحات (تحميل المزيد)
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}&searchType=image&num=10&start=${start}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json({ error: data.error?.message || "Google API Error" });
    }

    const data = await response.json();

    // تنسيق النتائج
    const results = (data.items || []).map(item => ({
      title: item.title || "",
      link: item.link || "",             // رابط الصورة المباشر (Full Image)
      displayLink: item.displayLink || "", 
      snippet: item.snippet || "",
      thumbnail: item.image?.thumbnailLink || "", // الصورة المصغرة للتحميل السريع
      context: item.image?.contextLink || ""      
    }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
