import fetch from "node-fetch"; 

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  const start = req.query.start || 1; 
  const CX = process.env.GOOGLE_CX;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  if (!CX) {
    return res.status(500).json({ error: "Google CX is missing in environment variables" });
  }

  const API_KEYS = [
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

  if (API_KEYS.length === 0) {
    return res.status(500).json({ error: "No Google API keys found in environment variables" });
  }

  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[i];
    
    try {
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${currentKey}&cx=${CX}&q=${encodeURIComponent(q)}&num=10&start=${start}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      // فحص إذا كان هناك خطأ في الاستجابة
      if (!response.ok) {
        const errorMessage = data.error?.message || "";
        
        // إذا كان الخطأ بسبب نفاد الحصة (سواء كان الكود 429 أو 403)
        if (response.status === 429 || errorMessage.toLowerCase().includes("quota")) {
          console.warn(`Key ${i + 1} exhausted (Quota exceeded). Trying next key...`);
          continue; // الانتقال للمفتاح التالي في الحلقة (Loop)
        }

        // إذا كان خطأ آخر غير الحصة، أرجعه للمستخدم
        return res.status(response.status).json({ error: errorMessage || "Google API Error" });
      }

      // إذا كانت الاستجابة ناجحة، قم بمعالجة البيانات وإرسالها
      const results = (data.items || []).map(item => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        displayLink: item.displayLink || "",
        image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || null 
      }));

      return res.status(200).json(results);

    } catch (err) {
      console.error(`Error with Key ${i + 1}:`, err.message);
      if (i === API_KEYS.length - 1) {
        return res.status(500).json({ error: "All API keys failed or connection error." });
      }
      continue;
    }
  }

  return res.status(429).json({ error: "Daily limit reached for all API keys. Please try again tomorrow." });
}
