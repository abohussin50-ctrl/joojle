// api/images/search.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    q,
    page = 1,
    size = "",
    color = "",
    type = "",
    safe = "active" // active | off
  } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query" });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  if (!API_KEY || !CX) {
    return res.status(500).json({ error: "Missing API key or CX" });
  }

  /* ----------------------------
     تحويل الفلاتر إلى Google API
  -----------------------------*/

  // حجم الصورة
  const imgSizeMap = {
    small: "icon",
    medium: "medium",
    large: "xxlarge"
  };

  // لون الصورة
  const imgColorMap = {
    color: "color",
    gray: "gray"
  };

  // نوع الصورة
  const imgTypeMap = {
    photo: "photo",
    clipart: "clipart"
  };

  const startIndex = (Number(page) - 1) * 10 + 1;

  const params = new URLSearchParams({
    key: API_KEY,
    cx: CX,
    q,
    searchType: "image",
    start: startIndex,
    safe
  });

  if (imgSizeMap[size]) params.append("imgSize", imgSizeMap[size]);
  if (imgColorMap[color]) params.append("imgColorType", imgColorMap[color]);
  if (imgTypeMap[type]) params.append("imgType", imgTypeMap[type]);

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`
    );

    const data = await response.json();

    if (!data.items) {
      return res.status(200).json([]);
    }

    /* ----------------------------
       تجهيز البيانات للواجهة
    -----------------------------*/
    const images = data.items.map(item => ({
      title: item.title,
      img: item.link,
      thumb: item.image?.thumbnailLink || item.link,
      width: item.image?.width || null,
      height: item.image?.height || null,
      source: item.displayLink
    }));

    res.status(200).json(images);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
