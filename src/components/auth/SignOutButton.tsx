"use client";

import { GUEST_AUTH_STORAGE_KEY } from "@/lib/guest-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = () => {
    setBusy(true);
    window.localStorage.removeItem(GUEST_AUTH_STORAGE_KEY);
    void fetch("/api/guest-session", { method: "DELETE" }).finally(() => {
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <button className="dn-top-pill px-3 py-2 text-xs font-black transition active:scale-[0.98] disabled:opacity-60" disabled={busy} onClick={signOut} type="button">
      &#36864;&#20986;
    </button>
  );
}
