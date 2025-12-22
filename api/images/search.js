export default async function handler(req, res) {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;

    if (!API_KEY || !CX) {
      return res.status(500).json({ error: "Missing API credentials" });
    }

    const url =
      `https://www.googleapis.com/customsearch/v1` +
      `?key=${API_KEY}` +
      `&cx=${CX}` +
      `&searchType=image` +
      `&q=${encodeURIComponent(q)}` +
      `&num=10`;         

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const results = (data.items || []).map(item => ({
      title: item.title,
      link: item.image?.contextLink || item.link,
      image: item.link,
      thumbnail: item.image?.thumbnailLink || null,
      width: item.image?.width || null,
      height: item.image?.height || null
    }));

    res.status(200).json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
