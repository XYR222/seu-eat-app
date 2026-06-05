import { mockRerank } from "@/lib/mock-ai";
import type { Candidate, Recommendation, UserMemory } from "@/types";

type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

function buildPrompt(query: string, memory: UserMemory, candidates: Candidate[]) {
  return [
    "用户需求：",
    query,
    "",
    "用户饭点记忆：",
    JSON.stringify(memory, null, 2),
    "",
    "候选菜品，只能从这些 foodId 中推荐：",
    candidates
      .map(
        (candidate) => `
foodId: ${candidate.food.id}
菜名: ${candidate.food.name}
食堂: ${candidate.food.canteen}
窗口: ${candidate.food.stall}
价格: ${candidate.food.price}
标签: ${candidate.food.tags.join("、")}
检索证据: ${candidate.evidence.join("；")}
风险: ${candidate.risk}
知识文本:
${candidate.ragText}
`,
      )
      .join("\n---\n"),
    "",
    "请输出 JSON，不要 Markdown，不要解释。",
  ].join("\n");
}

function parseJsonArray(text: string): Recommendation[] {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Recommendation[];
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

export async function rerankWithDeepSeek({
  query,
  memory,
  candidates,
}: {
  query: string;
  memory: UserMemory;
  candidates: Candidate[];
}): Promise<Recommendation[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return mockRerank(candidates);

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content:
        "你是校园食堂推荐助手。你只能从候选菜品中推荐，禁止编造菜名、价格、食堂、窗口、位置或评论。输出 JSON 数组，每项包含 foodId、score、reason、risk、evidence。只推荐 3 个。",
    },
    {
      role: "user",
      content: buildPrompt(query, memory, candidates),
    },
  ];

  try {
    const response = await fetch(process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) return mockRerank(candidates);
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return mockRerank(candidates);
    const parsed = JSON.parse(content) as { recommendations?: Recommendation[] } | Recommendation[];
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations ?? [];
    return recommendations.length ? recommendations : parseJsonArray(content);
  } catch {
    return mockRerank(candidates);
  }
}
