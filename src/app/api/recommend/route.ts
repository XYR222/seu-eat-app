import { recommendMeals } from "@/lib/recommend";
import { defaultMemory } from "@/lib/memory";
import type { RecommendRequest } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RecommendRequest>;
    const response = await recommendMeals({
      query: body.query || "随便推荐一顿",
      memory: body.memory ?? defaultMemory(),
      session: body.session ?? { previousRecommendations: [], currentConstraints: [] },
    });
    return NextResponse.json(response);
  } catch {
    const response = await recommendMeals({
      query: "15元以内，清淡，不要太咸，离教学楼近",
      memory: defaultMemory(),
      session: { previousRecommendations: [], currentConstraints: [] },
    });
    return NextResponse.json(response);
  }
}
