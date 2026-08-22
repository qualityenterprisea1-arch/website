"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/* Records the first touch of the session on whatever page the visitor lands on.
   Renders nothing. It sits in the root layout because people arrive on the
   homepage from a social link and only reach the form several clicks later, by
   which point the UTM tags are gone from the URL. */
export function Attribution() {
  useEffect(() => { captureAttribution(); }, []);
  return null;
}
