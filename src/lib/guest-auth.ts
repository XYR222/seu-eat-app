export const GUEST_AUTH_COOKIE = "seu-eat-guest";
export const GUEST_AUTH_STORAGE_KEY = "seu-eat-guest";

export type GuestAccount = {
  id: string;
  name: string;
  subtitle: string;
  tone: string;
};

export const GUEST_ACCOUNTS: GuestAccount[] = [
  { id: "guest-a", name: "游客 A", subtitle: "清淡省钱型", tone: "15元内、清淡、离教学楼近" },
  { id: "guest-b", name: "游客 B", subtitle: "重口探索型", tone: "能吃辣、爱尝新窗口" },
  { id: "guest-c", name: "游客 C", subtitle: "赶课效率型", tone: "出餐快、少排队、方便带走" },
  { id: "guest-d", name: "游客 D", subtitle: "随机纠结型", tone: "不知道吃啥，交给抽卡" },
];

export function getGuestAccount(id: string | null | undefined) {
  return GUEST_ACCOUNTS.find((account) => account.id === id) ?? GUEST_ACCOUNTS[0];
}

export function isGuestAccountId(id: string | null | undefined) {
  return GUEST_ACCOUNTS.some((account) => account.id === id);
}

export function normalizeGuestNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function buildGuestCookieValue(guestId: string, maxAgeSeconds: number) {
  return `${GUEST_AUTH_COOKIE}=${encodeURIComponent(guestId)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function buildClearGuestCookieValue() {
  return `${GUEST_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
