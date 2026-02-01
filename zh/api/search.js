import fetch from "node-fetch";

export default async function handler(req, res) {
    const q = req.query.q;
    const start = req.query.start || 1;
    const CX = process.env.GOOGLE_CX;

    const keys = [
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
    ].filter(k => k && k.trim() !== "");

    if (!q) return res.status(400).json({ error: "الرجاء إدخال نص للبحث" });
    if (!CX) return res.status(500).json({ error: "إعدادات المحرك (CX) غير مكتملة" });
    if (keys.length === 0) return res.status(500).json({ error: "لا توجد مفاتيح بحث متاحة" });

    let lastErrorMessage = "";

    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        
        try {
            // تم إضافة &lr=lang_zh-CN&hl=zh-CN للبحث باللغة الصينية المبسطة
            const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${currentKey}&cx=${CX}&q=${encodeURIComponent(q)}&num=10&start=${start}&lr=lang_zh-CN&hl=zh-CN`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok) {
                const results = (data.items || []).map(item => ({
                    title: item.title || "",
                    link: item.link || "",
                    snippet: item.snippet || "",
                    displayLink: item.displayLink || "",
                    image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || null
                }));
                
                console.log(`✅ نجاح: تم استخدام المفتاح رقم ${i + 1} (اللغة: الصينية)`);
                return res.status(200).json(results);
            }

            const errorMsg = data.error?.message || "";
            lastErrorMessage = errorMsg;

            if (response.status === 429 || response.status === 403) {
                continue; 
            } else {
                return res.status(response.status).json({ error: `خطأ من جوجل: ${errorMsg}` });
            }

        } catch (err) {
            lastErrorMessage = err.message;
            continue; 
        }
    }

    return res.status(429).json({ 
        error: "انتهت حصة جميع المشاريع الـ 10 لهذا اليوم.",
        details: lastErrorMessage 
    });
}