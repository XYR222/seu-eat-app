import { GUEST_ACCOUNTS, GUEST_AUTH_COOKIE, isGuestAccountId } from "@/lib/guest-auth";
import { NextResponse } from "next/server";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { guestId?: unknown } | null;
  const guestId = typeof body?.guestId === "string" ? body.guestId : "";

  if (!isGuestAccountId(guestId)) {
    return NextResponse.json({ ok: false, error: "invalid guest" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, guest: GUEST_ACCOUNTS.find((account) => account.id === guestId) });
  response.cookies.set(GUEST_AUTH_COOKIE, guestId, {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(GUEST_AUTH_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return response;
}
