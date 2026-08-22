import { NextResponse, type NextRequest } from "next/server";

/* Supabase sends a magic link to whatever it resolves as the redirect target.
 * When the requested redirect_to is not in the project's allow list it falls
 * back to the Site URL *silently*, so a misconfigured project lands the user on
 * the site root carrying an auth code that only /leads knows how to exchange.
 *
 * Rather than leaving that as a dead end, forward any auth code arriving at the
 * root to the desk that can consume it. Costs one redirect and removes a whole
 * class of "I clicked the link and nothing happened".
 */
export function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  if (pathname !== "/") return NextResponse.next();

  // PKCE sends ?code=; the older flow sends ?token_hash=&type=. An error comes
  // back as ?error=, which /leads should show rather than the homepage swallow.
  if (!searchParams.has("code") && !searchParams.has("token_hash") && !searchParams.has("error")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/leads";
  return NextResponse.redirect(url);
}

export const config = {
  // Only the root. Everything else, including /leads itself, is untouched.
  matcher: "/",
};
