import { GUEST_AUTH_COOKIE, isGuestAccountId } from "@/lib/guest-auth";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATH_PREFIXES = ["/login", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function updateSupabaseSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guestId = request.cookies.get(GUEST_AUTH_COOKIE)?.value;
  const isGuestAuthenticated = isGuestAccountId(guestId);

  if (!isGuestAuthenticated && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestAuthenticated && pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next({ request });
}
