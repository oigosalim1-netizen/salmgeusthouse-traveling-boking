"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
  const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false);
  async function submit(event:FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const supabase=createClient(); const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; router.push("/bookings"); router.refresh(); }
    catch(error) { setMessage(error instanceof Error?error.message:"Sign in failed."); }
    finally { setBusy(false); }
  }
  return <main className="wrap"><nav className="nav"><Link className="brand" href="/">Salim&apos;s Travel</Link><Link href="/signup">Create account</Link></nav><section className="hero"><div className="eyebrow">Welcome back</div><h1>Sign in</h1><p>Access your travel and guest-house bookings.</p></section><form className="card" onSubmit={submit} style={{maxWidth:520,display:"grid",gap:14}}><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="btn" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{message&&<p role="alert">{message}</p>}</form></main>;
}
