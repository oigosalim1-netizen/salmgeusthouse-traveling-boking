"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone } }
      });
      if (error) throw error;
      setMessage("Registration submitted. Check your email if confirmation is enabled, then sign in.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create account."); }
    finally { setBusy(false); }
  }

  return <main className="wrap"><nav className="nav"><Link className="brand" href="/">Salim&apos;s Travel</Link><Link href="/login">Sign in</Link></nav><section className="hero"><div className="eyebrow">Customer account</div><h1>Create your account</h1><p>Register to make and manage your travel and room bookings.</p></section><form className="card" onSubmit={submit} style={{maxWidth:520,display:"grid",gap:14}}><label>Full name<input required value={fullName} onChange={e=>setFullName(e.target.value)} /></label><label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} /></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="btn" disabled={busy}>{busy?"Creating account…":"Create account"}</button>{message&&<p role="status">{message}</p>}</form></main>;
}
