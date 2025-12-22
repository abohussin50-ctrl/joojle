// /api/search.js
import fetch from "node-fetch"; 

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  const start = req.query.start || 1;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  if (!API_KEY || !CX) {
    return res.status(500).json({ error: "Google API key or CX is missing in environment variables" });
  }

  try {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}&num=10&start=${start}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || "Google API Error" });
    }

    const data = await response.json();

    const results = (data.items || []).map(item => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || "",
      image: item.pagemap?.cse_image?.[0]?.src || null 
    }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
