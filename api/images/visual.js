import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import cheerio from "cheerio";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: { bodyParser: false },
};

export default function handler(req, res) {
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "Upload error" });
    if (!req.file) return res.status(400).json({ error: "No image" });

    try {
      // 1) تجهيز رفع الصورة
      const form = new FormData();
      form.append("upfile", req.file.buffer, {
        filename: "image.jpg",
        contentType: req.file.mimetype,
      });

      // 2) إرسال الصورة إلى Yandex
      const yandexRes = await axios.post(
        "https://yandex.com/images/search",
        form,
        {
          headers: form.getHeaders(),
          maxRedirects: 0,
          validateStatus: s => s === 302,
        }
      );

      // 3) الحصول على رابط النتائج
      const redirectUrl = yandexRes.headers.location;
      const html = (await axios.get("https://yandex.com" + redirectUrl)).data;

      // 4) استخراج الصور
      const $ = cheerio.load(html);
      const results = [];

      $(".serp-item__thumb img").each((_, el) => {
        const src = $(el).attr("src");
        if (src && src.startsWith("http")) {
          results.push({ img: src });
        }
      });

      res.json(results.slice(0, 30));
    } catch (e) {
      res.status(500).json({ error: "Visual search failed" });
    }
  });
}
