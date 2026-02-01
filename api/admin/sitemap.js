
import { MeiliSearch } from "meilisearch";
export default async function handler(req,res){
 const client = new MeiliSearch({ host: process.env.MEILI_HOST });
 const docs = await client.index("pages").getDocuments();
 const xml = docs.results.map(d =>
  `<url><loc>${d.url}</loc></url>`
 ).join("");
 res.setHeader("Content-Type","application/xml");
 res.send(`<urlset>${xml}</urlset>`);
}
