"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Booking={id:string;booking_reference:string;kind:string;status:string;created_at:string};
type Route={id:string;origin:string;destination:string;price_kes:number;max_group_size:number;active:boolean};
type Room={id:string;room_name:string;price_per_night_kes:number;active:boolean;guest_houses:{name:string;location:string}|null};

export default function AdminPage(){
 const [allowed,setAllowed]=useState(false);const [checking,setChecking]=useState(true);const [message,setMessage]=useState("");
 const [origin,setOrigin]=useState("Nairobi");const [destination,setDestination]=useState("");const [fare,setFare]=useState("11000");const [group,setGroup]=useState("7");
 const [house,setHouse]=useState("");const [location,setLocation]=useState("");const [room,setRoom]=useState("");const [roomPrice,setRoomPrice]=useState("");
 const [bookings,setBookings]=useState<Booking[]>([]);const [routes,setRoutes]=useState<Route[]>([]);const [rooms,setRooms]=useState<Room[]>([]);const [uploading,setUploading]=useState(false);
 const supabase=createClient();

 async function load(){
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){setMessage("Sign in with the administrator account.");setChecking(false);return;}
   const {data:profile,error}=await supabase.from("profiles").select("role").eq("id",user.id).single();
   if(error||profile?.role!=="admin"){setMessage("This account does not have administrator access.");setChecking(false);return;}
   setAllowed(true);
   const [bookingResult,routeResult,roomResult]=await Promise.all([
     supabase.from("bookings").select("id,booking_reference,kind,status,created_at").order("created_at",{ascending:false}),
     supabase.from("travel_routes").select("id,origin,destination,price_kes,max_group_size,active").order("created_at",{ascending:false}),
     supabase.from("rooms").select("id,room_name,price_per_night_kes,active,guest_houses(name,location)").order("created_at",{ascending:false})
   ]);
   if(bookingResult.error)setMessage(bookingResult.error.message);else setBookings(bookingResult.data||[]);
   if(routeResult.error)setMessage(routeResult.error.message);else setRoutes((routeResult.data||[]) as Route[]);
   if(roomResult.error)setMessage(roomResult.error.message);else setRooms((roomResult.data||[]) as unknown as Room[]);
   setChecking(false);
 }
 useEffect(()=>{void load();},[]);

 async function addRoute(e:FormEvent){e.preventDefault();setMessage("");const {error}=await supabase.from("travel_routes").insert({origin,destination,price_kes:Number(fare),max_group_size:Number(group),description:"Family Trip Package"});if(error)setMessage(error.message);else{setMessage("Travel route and fare saved.");setDestination("");await load();}}
 async function addRoom(e:FormEvent){e.preventDefault();setMessage("");const {data,error}=await supabase.from("guest_houses").insert({name:house,location}).select("id").single();if(error){setMessage(error.message);return;}const {error:roomError}=await supabase.from("rooms").insert({guest_house_id:data.id,room_name:room,price_per_night_kes:Number(roomPrice)});if(roomError){setMessage(roomError.message);return;}setMessage("Guest house and room saved.");setHouse("");setLocation("");setRoom("");setRoomPrice("");await load();}
 async function updateRoute(id:string,patch:Partial<Route>){const {error}=await supabase.from("travel_routes").update(patch).eq("id",id);setMessage(error?error.message:"Travel fare updated.");if(!error)await load();}
 async function updateRoom(id:string,patch:Partial<Room>){const {error}=await supabase.from("rooms").update(patch).eq("id",id);setMessage(error?error.message:"Room price updated.");if(!error)await load();}
 async function updateStatus(id:string,status:string){const {error}=await supabase.from("bookings").update({status}).eq("id",id);if(error)setMessage(error.message);else{setBookings(old=>old.map(b=>b.id===id?{...b,status}:b));setMessage("Booking status updated.");}}
 async function uploadMedia(e:FormEvent<HTMLFormElement>){e.preventDefault();const input=e.currentTarget.elements.namedItem("media") as HTMLInputElement;const file=input.files?.[0];if(!file)return;if(file.size>100*1024*1024){setMessage("The maximum file size is 100 MB.");return;}setUploading(true);try{const ext=file.name.split(".").pop()||"file";const path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;const {error}=await supabase.storage.from("site-media").upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;const mediaType=file.type.startsWith("video/")?"video":"image";const {error:recordError}=await supabase.from("media_assets").insert({title:file.name,file_path:path,media_type:mediaType,is_public:true});if(recordError)throw recordError;setMessage("Media uploaded and published on the website gallery.");input.value="";}catch(error){setMessage(error instanceof Error?error.message:"Upload failed.");}finally{setUploading(false);}}

 if(checking)return <main className="wrap"><p>Checking administrator access…</p></main>;
 if(!allowed)return <main className="wrap"><nav className="nav"><Link className="brand" href="/">Salim Travel And Comfy AirBnB</Link></nav><h1>Admin dashboard</h1><p>{message}</p><Link className="btn" href="/login">Sign in</Link></main>;
 return <main className="wrap">
  <nav className="nav"><Link className="brand" href="/">Salim Travel And Comfy AirBnB</Link><div className="links"><Link href="/bookings">Customer view</Link><button className="btn secondary" onClick={async()=>{await supabase.auth.signOut();location.href="/login";}}>Sign out</button></div></nav>
  <section className="hero"><div className="eyebrow">Administration</div><h1>Manage your bookings and listings</h1><p>Add and update travel fares, Airbnb room prices, publish photos and videos, and manage customer bookings.</p></section>
  {message&&<p role="status">{message}</p>}
  <div className="cards">
   <form className="card" onSubmit={addRoute}><h2>Add travel fare</h2><label>From<input value={origin} onChange={e=>setOrigin(e.target.value)} required/></label><label>Destination<input value={destination} onChange={e=>setDestination(e.target.value)} required/></label><label>Total group fare (KES)<input type="number" min="0" value={fare} onChange={e=>setFare(e.target.value)} required/></label><label>Maximum group size<input type="number" min="1" value={group} onChange={e=>setGroup(e.target.value)} required/></label><button className="btn">Save travel fare</button></form>
   <form className="card" onSubmit={addRoom}><h2>Add Airbnb / room</h2><label>Property name<input value={house} onChange={e=>setHouse(e.target.value)} required/></label><label>Location<input value={location} onChange={e=>setLocation(e.target.value)} required/></label><label>Room name<input value={room} onChange={e=>setRoom(e.target.value)} required/></label><label>Price per night (KES)<input type="number" min="0" value={roomPrice} onChange={e=>setRoomPrice(e.target.value)} required/></label><button className="btn">Save room</button></form>
   <form className="card" onSubmit={uploadMedia}><h2>Upload photos or video</h2><p>Images and videos up to 100 MB can be published to the website gallery.</p><input name="media" type="file" accept="image/*,video/mp4,video/webm,video/quicktime" required/><button className="btn" disabled={uploading}>{uploading?"Uploading…":"Upload media"}</button></form>
  </div>
  <section className="section"><h2>Update travel fares</h2>{routes.length===0?<p>No travel routes added yet.</p>:<div className="cards">{routes.map(r=><article className="card" key={r.id}><h3>{r.origin} → {r.destination}</h3><label>Group fare (KES)<input type="number" min="0" defaultValue={r.price_kes} onBlur={e=>{const v=Number(e.target.value);if(v!==Number(r.price_kes))void updateRoute(r.id,{price_kes:v});}}/></label><label>Maximum group size<input type="number" min="1" defaultValue={r.max_group_size} onBlur={e=>{const v=Number(e.target.value);if(v!==Number(r.max_group_size))void updateRoute(r.id,{max_group_size:v});}}/></label><button className="btn secondary" onClick={()=>void updateRoute(r.id,{active:!r.active})}>{r.active?"Hide from customers":"Publish to customers"}</button></article>)}</div>}</section>
  <section className="section"><h2>Update Airbnb room prices</h2>{rooms.length===0?<p>No rooms added yet.</p>:<div className="cards">{rooms.map(r=><article className="card" key={r.id}><h3>{r.guest_houses?.name||"Airbnb"} — {r.room_name}</h3><p>{r.guest_houses?.location||""}</p><label>Price per night (KES)<input type="number" min="0" defaultValue={r.price_per_night_kes} onBlur={e=>{const v=Number(e.target.value);if(v!==Number(r.price_per_night_kes))void updateRoom(r.id,{price_per_night_kes:v});}}/></label><button className="btn secondary" onClick={()=>void updateRoom(r.id,{active:!r.active})}>{r.active?"Hide from customers":"Publish to customers"}</button></article>)}</div>}</section>
  <section className="section"><h2>Customer bookings</h2>{bookings.length===0?<p>No bookings received yet.</p>:<div className="cards">{bookings.map(b=><article className="card" key={b.id}><div className="eyebrow">{b.kind}</div><h3>{b.booking_reference}</h3><p>Status: <strong>{b.status}</strong></p><small>{new Date(b.created_at).toLocaleString()}</small><div className="actions"><button className="btn" onClick={()=>updateStatus(b.id,"confirmed")}>Confirm</button><button className="btn secondary" onClick={()=>updateStatus(b.id,"cancelled")}>Cancel</button><button className="btn secondary" onClick={()=>updateStatus(b.id,"completed")}>Complete</button></div></article>)}</div>}</section>
 </main>;
}
