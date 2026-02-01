
export default function handler(req,res){
 const {title,content} = req.body;
 res.json({
  titleLength: title.length,
  contentLength: content.length,
  score: Math.min(100, title.length + content.length / 20)
 });
}
