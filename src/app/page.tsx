import { AppShell } from "@/components/AppShell";
import { GUEST_AUTH_COOKIE, getGuestAccount } from "@/lib/guest-auth";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_AUTH_COOKIE)?.value;
  const guest = getGuestAccount(guestId);

  return <AppShell guestId={guest.id} userEmail={guest.name} />;
}
