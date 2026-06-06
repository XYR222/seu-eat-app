"use client";

import { GUEST_ACCOUNTS, GUEST_AUTH_STORAGE_KEY, normalizeGuestNextPath } from "@/lib/guest-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busyGuestId, setBusyGuestId] = useState<string | null>(null);
  const nextPath = normalizeGuestNextPath(searchParams.get("next"));

  const enterAsGuest = async (guestId: string) => {
    setBusyGuestId(guestId);
    const response = await fetch("/api/guest-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId }),
    });
    if (!response.ok) {
      setBusyGuestId(null);
      return;
    }
    window.localStorage.setItem(GUEST_AUTH_STORAGE_KEY, guestId);
    router.replace(nextPath);
    router.refresh();
  };

  return (
    <section className="rounded-lg border border-emerald-100 bg-white p-4 shadow-[0_14px_30px_rgba(41,37,30,0.08)]">
      <div className="mb-4">
        <p className="text-sm font-black text-stone-950">选择一个游客身份</p>
        <p className="mt-1 text-xs font-bold leading-5 text-stone-500">不用真实邮箱，点击即用。每个身份会在本机保留独立的偏好、历史和收藏。</p>
      </div>

      <div className="grid gap-2">
        {GUEST_ACCOUNTS.map((account) => (
          <button
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.99]"
            disabled={Boolean(busyGuestId)}
            key={account.id}
            onClick={() => enterAsGuest(account.id)}
            type="button"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-base font-black text-stone-950">{account.name}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">{busyGuestId === account.id ? "进入中" : account.subtitle}</span>
            </span>
            <span className="mt-1 block text-xs font-bold leading-5 text-stone-500">{account.tone}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900">这是黑客松演示登录，不创建真实账号；公共评论和点赞仍会同步到 Supabase。</p>
    </section>
  );
}
