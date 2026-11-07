"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Booking = { id:string; booking_reference:string; kind:string; status:string; created_at:string; passengers:number|null; check_in:string|null; check_out:string|null };
export default function BookingsPage() {
  const [rows,setRows]=useState<Booking[]>([]); const [message,setMessage]=useState("Loading your bookings…");
  useEffect(()=>{ let active=true; (async()=>{ const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user){ if(active)setMessage("Please sign in to view your bookings."); return; } const {data,error}=await supabase.from("bookings").select("id,booking_reference,kind,status,created_at,passengers,check_in,check_out").order("created_at",{ascending:false}); if(active){if(error)setMessage(error.message);else{setRows(data||[]);setMessage(data?.length?"":"You have no bookings yet.");}} })(); return ()=>{active=false;};},[]);
  return <main className="wrap"><nav className="nav"><Link className="brand" href="/">Salim&apos;s Travel</Link><div className="links"><Link href="/book-travel">Book travel</Link><Link href="/find-house">Find a room</Link></div></nav><section className="hero"><div className="eyebrow">Your account</div><h1>My bookings</h1><p>View the status of your travel and room reservations.</p></section>{rows.length>0?<div className="cards">{rows.map(row=><article className="card" key={row.id}><div className="eyebrow">{row.kind==="travel"?"Travel booking":"Guest-house booking"}</div><h2>{row.booking_reference}</h2><p>Status: <strong>{row.status}</strong></p>{row.passengers&&<p>Passengers: {row.passengers}</p>}{row.check_in&&<p>Stay: {row.check_in} to {row.check_out}</p>}<small>{new Date(row.created_at).toLocaleDateString()}</small></article>)}</div>:<p>{message}</p>}</main>;
}
