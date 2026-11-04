# Travel & Guest House Booking Platform

Starter app for travel and guest-house booking requests, with customer accounts and an admin dashboard planned. **No payments or money tracking are included.**

## Stack
Next.js App Router + TypeScript; Supabase Auth + PostgreSQL.

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key.
4. Run `supabase/schema.sql` in Supabase SQL Editor.
5. Run `npm run dev` and visit http://localhost:3000.

## Included
- Responsive starter landing page
- Supabase client helper
- Schema for profiles, travel routes/departures, guest houses/rooms, and bookings
- Booking references and status tracking

## Next
Implement authentication, booking forms and history, availability validation, and admin dashboard. Secure admin-only policies must be completed before production. Never expose a Supabase service-role key in browser code.
