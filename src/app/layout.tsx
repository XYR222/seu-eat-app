import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "东南今天吃点啥",
  description: "基于校园菜单、同学反馈和个人偏好的 AI 饭点决策助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
