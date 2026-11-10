"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MediaAsset={id:string;title:string;file_path:string;media_type:"image"|"video"};

export default function MediaGallery(){
 const [items,setItems]=useState<Array<MediaAsset & {url:string}>>([]);
 useEffect(()=>{
  let active=true;
  (async()=>{
   const supabase=createClient();
   const {data,error}=await supabase.from("media_assets").select("id,title,file_path,media_type").eq("is_public",true).order("created_at",{ascending:false});
   if(!active||error||!data)return;
   const rows=data as MediaAsset[];
   setItems(rows.map(item=>({...item,url:supabase.storage.from("site-media").getPublicUrl(item.file_path).data.publicUrl})));
  })();
  return ()=>{active=false;};
 },[]);
 if(items.length===0)return null;
 return <section className="section"><h2>Travel and Airbnb Gallery</h2><p>Explore photos and videos from our travel and accommodation listings.</p><div className="cards">{items.map(item=><article className="card" key={item.id}>{item.media_type==="video"?<video src={item.url} controls preload="metadata" style={{width:"100%",borderRadius:12}}/>:<img src={item.url} alt={item.title} loading="lazy" style={{width:"100%",height:220,objectFit:"cover",borderRadius:12}}/>}<p>{item.title}</p></article>)}</div></section>;
}
