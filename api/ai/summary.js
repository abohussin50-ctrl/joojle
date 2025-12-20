
export default async function handler(req,res){
 const {content} = JSON.parse(req.body);
 const summary = content.split(" ").slice(0,30).join(" ") + "...";
 res.json({summary});
}
