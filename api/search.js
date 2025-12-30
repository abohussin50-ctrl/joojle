import fetch from "node-fetch";

export default async function handler(req, res) {
    const q = req.query.q;
    const start = req.query.start || 1;
    const CX = process.env.GOOGLE_CX;

    // جلب المفاتيح من المتغيرات البيئية
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
    if (!CX) return res.status(500).json({ error: "معرف المحرك (CX) مفقود" });
    if (keys.length === 0) return res.status(500).json({ error: "لم يتم العثور على مفاتيح API" });

    // المحاولة عبر المفاتيح واحد تلو الآخر
    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        console.log(`محاولة البحث باستخدام المفتاح رقم ${i + 1}...`);

        try {
            const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${currentKey}&cx=${CX}&q=${encodeURIComponent(q)}&num=10&start=${start}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            // إذا كانت الاستجابة ناجحة (200 OK)
            if (response.ok) {
                console.log(`تم بنجاح باستخدام المفتاح ${i + 1}`);
                const results = (data.items || []).map(item => ({
                    title: item.title || "",
                    link: item.link || "",
                    snippet: item.snippet || "",
                    displayLink: item.displayLink || "",
                    image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || null
                }));
                return res.status(200).json(results);
            }

            // إذا فشل المفتاح الحالي (خطأ 429 أو 403 أو رسالة Quota)
            const errorMsg = data.error?.message || "";
            if (response.status === 429 || response.status === 403 || errorMsg.toLowerCase().includes("quota")) {
                console.warn(`المفتاح ${i + 1} مستهلك. ننتقل للمفتاح التالي...`);
                continue; // إجبار الكود على تجربة المفتاح التالي
            } else {
                // إذا كان الخطأ شيئاً آخر (مثل نص بحث غير صالح)، أظهره وتوقف
                return res.status(response.status).json({ error: errorMsg });
            }

        } catch (err) {
            console.error(`خطأ تقني في المفتاح ${i + 1}:`, err.message);
            if (i === keys.length - 1) {
                return res.status(500).json({ error: "جميع المحاولات فشلت بسبب خطأ في الاتصال" });
            }
            continue;
        }
    }

    // إذا خرجنا من الحلقة دون نتيجة
    return res.status(429).json({ error: "للأسف، جميع المفاتيح الـ 10 استنفدت حصتها اليومية." });
}
