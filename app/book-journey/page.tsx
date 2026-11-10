"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Route={id:string;origin:string;destination:string;price_kes:number;max_group_size:number};

const counties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
  "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
  "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
  "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
  "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

export default function BookJourneyPage() {
  const [routes,setRoutes]=useState<Route[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  useEffect(()=>{
    let active=true;
    (async()=>{
      const supabase=createClient();
      const {data,error}=await supabase.from("travel_routes").select("id,origin,destination,price_kes,max_group_size").eq("active",true).order("destination");
      if(!active)return;
      if(error)setMessage("Travel fares are temporarily unavailable. Please contact us for a quote.");
      else setRoutes((data||[]) as Route[]);
      setLoading(false);
    })();
    return ()=>{active=false;};
  },[]);
  const configuredDestinations=new Set(routes.map(r=>r.destination.toLowerCase()));
  return (
    <main className="wrap">
      <nav className="nav">
        <a className="brand" href="/">Salim Travel And Comfy AirBnB</a>
        <a href="/book-travel">Back to choices</a>
      </nav>
      <section className="hero">
        <div className="eyebrow">Family Trip Package</div>
        <h1>Travel together, make memories</h1>
        <p>Private family and group trips from Nairobi to destinations across Kenya.</p>
        <div className="card">
          <h2>Family Trip Package</h2>
          <p><strong>Maximum group size: 7 people</strong></p>
          <p>Travel as a group in one package. Published fares are managed by the administrator.</p>
        </div>
      </section>
      <section className="section">
        <h2>Published travel fares</h2>
        {loading?<p>Loading current fares…</p>:routes.length===0?<p>No travel fares have been published yet. Contact us for a quote.</p>:(
          <div className="cards">
            {routes.map(route=>(
              <article className="card" key={route.id}>
                <h3>{route.origin} → {route.destination}</h3>
                <p><strong>KES {Number(route.price_kes).toLocaleString()}</strong></p>
                <p>Total package for up to {route.max_group_size} people.</p>
                <a className="btn" href="tel:+254717818330">Call to book</a>
              </article>
            ))}
          </div>
        )}
        {message&&<p role="status">{message}</p>}
      </section>
      <section className="section">
        <h2>Other destinations</h2>
        <div className="grid">
          {counties.filter(county=>!configuredDestinations.has(county.toLowerCase())).map(county=>(
            <article className="card" key={county}>
              <h3>Nairobi → {county}</h3>
              <p>Request a fare quote for your group.</p>
              <a className="btn secondary" href={"https://wa.me/254717818330?text="+encodeURIComponent("Hello, I would like a family trip quote from Nairobi to "+county+".")} target="_blank" rel="noreferrer">Request a quote</a>
            </article>
          ))}
        </div>
        <p className="note">Only fares published by the administrator are shown as confirmed prices. Please request a quote for other destinations.</p>
      </section>
    </main>
  );
}
