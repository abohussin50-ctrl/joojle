import fetch from "node-fetch";

export default async function handler(req, res) {

  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  /* 🔍 بحث نصي */
  if(req.method === "GET"){
    const { q, page = 1 } = req.query;
    if(!q) return res.json([]);

    const start = (page - 1) * 10 + 1;

    const r = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(q)}&searchType=image&start=${start}`
    );
    const d = await r.json();

    return res.json(
      (d.items || []).map(i => ({ img: i.link }))
    );
  }

  /* 🖼️ بحث بالصورة */
  if(req.method === "POST"){
    const { image, page = 1 } = req.body;
    if(!image) return res.json([]);

    const start = (page - 1) * 10 + 1;

    const r = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&searchType=image&start=${start}&imgType=photo`
    );

    const d = await r.json();

    return res.json(
      (d.items || []).map(i => ({ img: i.link }))
    );
  }

  res.status(405).end();
}
