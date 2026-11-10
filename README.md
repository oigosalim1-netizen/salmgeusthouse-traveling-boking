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


## Admin dashboard setup

1. Run `supabase/schema.sql` in the Supabase SQL Editor if you have not already done so.
2. Run `supabase/admin-setup.sql` in the same SQL Editor. This adds the fare and room-price columns, creates the public media library and 100 MB storage bucket, and installs administrator-only policies.
3. Register your own customer account through the website's **Create account** page.
4. In Supabase SQL Editor, replace the email below with the email you used to register and run it:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (
     select id from auth.users
     where email = 'YOUR-LOGIN-EMAIL'
   );
   ```

5. Sign in on the website and open `/admin`.

The admin page lets the administrator add and update travel fares, add Airbnb properties and rooms, change room prices, publish or hide listings, upload photos/videos up to 100 MB, and manage customer booking statuses. Published media appears in the home-page gallery.

**Security:** Do not make customers administrators, do not let sign-up forms set roles, and never put the Supabase service-role key in a `NEXT_PUBLIC_...` variable.
