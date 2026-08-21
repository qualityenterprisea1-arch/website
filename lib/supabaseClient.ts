"use client";

import { createClient } from "@supabase/supabase-js";

/* The browser client for the staff leads desk.
 *
 * It carries the anon key only. Every table it touches is behind RLS keyed to
 * the signed-in address being in staff_allowlist, so the key on its own opens
 * nothing — which is the whole reason this app can be public-facing at all,
 * unlike the local dashboard that had to hold a service-role key.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const configured = Boolean(url && anon);

export const supabase = configured
  ? createClient(url!, anon!, {
      auth: {
        // A magic link arrives as a URL fragment; this consumes it on load.
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
      },
    })
  : null;
