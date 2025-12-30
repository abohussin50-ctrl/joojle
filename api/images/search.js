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

  const apiKeys = [
    process.env.GOOGLE_API_KEY_1,
    process.env.GOOGLE_API_KEY_2,
    process.env.GOOGLE_API_KEY_3,
    process.env.GOOGLE_API_KEY_4,
    process.env.GOOGLE_API_KEY_5,
    process.env.GOOGLE_API_KEY_6,
    process.env.GOOGLE_API_KEY_7,
    process.env.GOOGLE_API_KEY_8,
    process.env.GOOGLE_API_KEY_9,
    process.env.GOOGLE_API_KEY_10
  ].filter(key => key);  

  const CX = process.env.GOOGLE_CX;

  if (apiKeys.length === 0 || !CX) {
    return res.status(500).json({ error: "Missing API keys or CX configuration" });
  }

  const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  try {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${randomKey}&cx=${CX}&q=${encodeURIComponent(q)}&searchType=image&num=10&start=${start}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json({ error: data.error?.message || "Google API Error" });
    }

    const data = await response.json();

    const results = (data.items || []).map(item => ({
      title: item.title || "",
      link: item.link || "",          
      displayLink: item.displayLink || "", 
      snippet: item.snippet || "",
      thumbnail: item.image?.thumbnailLink || "", 
      context: item.image?.contextLink || ""    
    }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
