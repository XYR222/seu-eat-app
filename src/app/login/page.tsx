import { LoginPanel } from "@/components/auth/LoginPanel";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0,#f8f5ee_34%,#eff7ee_100%)] px-4 py-8 text-stone-900">
      <div className="mx-auto max-w-md">
        <div className="mb-5">
          <p className="text-sm font-black text-emerald-700">东南今天吃点啥</p>
          <h1 className="mt-2 text-2xl font-black text-stone-950">选择游客身份，马上开始</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-600">不用邮箱注册。为了方便小组测试和现场演示，我们准备了 4 个游客身份，点击即可进入应用。</p>
        </div>
        <Suspense fallback={<div className="rounded-lg border border-emerald-100 bg-white p-4 text-sm font-bold text-stone-600">正在准备游客登录...</div>}>
          <LoginPanel />
        </Suspense>
      </div>
    </main>
  );
}
