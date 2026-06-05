import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { menuText?: string };
  const text = body.menuText || "番茄鸡蛋盖饭 12元；青菜豆腐汤面 10元；鸡胸肉轻食饭 16元";
  const items = text
    .split(/[；;\n]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const price = line.match(/(\d+)\s*元/);
      const name = line.replace(/\s*\d+\s*元.*/, "").trim();
      return {
        name,
        price: price ? Number(price[1]) : undefined,
        tags: name.includes("面") ? ["面食"] : name.includes("饭") ? ["米饭"] : [],
        spicy: line.includes("辣") ? "yes" : "unknown",
        notes: "从菜单文本解析，可人工确认后加入知识库",
      };
    });
  return NextResponse.json({ items });
}
