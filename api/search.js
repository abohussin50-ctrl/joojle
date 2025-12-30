import fetch from "node-fetch"; 

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  const start = req.query.start || 1; 
  const CX = process.env.GOOGLE_CX;

  // جلب كافة المفاتيح المتوفرة وتنظيف المصفوفة من القيم الفارغة
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
  ].filter(key => key && key.trim() !== "");

  if (!q) return res.status(400).json({ error: "Query is required" });
  if (!CX) return res.status(500).json({ error: "Google CX missing" });
  if (API_KEYS.length === 0) return res.status(500).json({ error: "No API Keys configured" });

  // حلقة المرور على المفاتيح
  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[i];
    
    try {
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${currentKey}&cx=${CX}&q=${encodeURIComponent(q)}&num=10&start=${start}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || "";
        const reason = data.error?.errors?.[0]?.reason || "";

        // فحص شامل لنفاد الحصة: (كود 429) أو (كود 403 مع رسالة quota)
        if (response.status === 429 || errorMsg.toLowerCase().includes("quota") || reason === "dailyLimitExceeded") {
          console.warn(`Key ${i + 1} exhausted. Switching to next...`);
          continue; // هذا السطر هو الذي يجعل الكود ينتقل للمفتاح التالي
        }

        // إذا كان خطأ آخر غير الحصة (مثلاً خطأ في الـ CX)، أظهره للمستخدم وتوقف
        return res.status(response.status).json({ error: errorMsg });
      }

      // إذا وصلنا هنا، يعني الطلب نجح بالمفتاح الحالي
      const results = (data.items || []).map(item => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        displayLink: item.displayLink || "",
        image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || null 
      }));

      return res.status(200).json(results);

    } catch (err) {
      console.error(`Fetch error with key ${i + 1}:`, err.message);
      // في حالة وجود خطأ في الاتصال، ننتقل للمفتاح التالي
      continue; 
    }
  }

  // إذا انتهت الحلقة ولم يتم إرجاع أي نتيجة (يعني كل المفاتيح فشلت)
  return res.status(429).json({ 
    error: "جميع مفاتيح البحث استنفدت حصتها اليومية. يرجى المحاولة غداً." 
  });
}
