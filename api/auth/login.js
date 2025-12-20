
import jwt from "jsonwebtoken";

export default function handler(req,res){
  const {username,password} = JSON.parse(req.body);
  if(username==="admin" && password==="admin"){
    const token = jwt.sign({role:"admin"}, process.env.JWT_SECRET);
    res.json({token});
  } else {
    res.status(401).json({error:"Unauthorized"});
  }
}
