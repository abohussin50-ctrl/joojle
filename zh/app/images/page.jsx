
"use client";
import {useState} from "react";
export default function Images(){
 const [q,setQ]=useState("");
 const [imgs,setImgs]=useState([]);
 async function search(){
  const r=await fetch(`/api/images/search?q=${q}`);
  setImgs(await r.json());
 }
 return (
  <div className="p-10">
   <input className="border p-2" onChange={e=>setQ(e.target.value)}
    onKeyDown={e=>e.key==="Enter"&&search()} placeholder="بحث صور"/>
   <div className="grid grid-cols-4 gap-4 mt-6">
    {imgs.map((i,idx)=>(
      <a key={idx} href={i.url} target="_blank">
        <img src={i.img} className="w-full"/>
      </a>
    ))}
   </div>
  </div>
 )
}
