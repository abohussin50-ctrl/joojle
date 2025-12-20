
import { MeiliSearch } from "meilisearch";
const client = new MeiliSearch({ host: process.env.MEILI_HOST });

export default async function handler(req,res){
  const q = req.query.q;
  const r = await client.index("pages").search(q);
  const images = r.hits.flatMap(p =>
    (p.images||[]).map(img => ({img, url:p.url}))
  );
  res.json(images);
}
