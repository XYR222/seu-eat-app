# AGENTS.md

## Project

Project name: 东南今天吃点啥

This is a mobile-first web app for an AI hackathon. It helps students decide what to eat on campus using:

- Real or simulated campus food data.
- Student feedback such as likes, dislikes, tags, and short comments.
- Lightweight RAG-style retrieval.
- Lightweight memory extracted from user queries and feedback.
- A playful "draw a meal" card interface.

The product is a campus meal-decision tool, not a food delivery platform, not a merchant system, and not a full social review community.

## Product Shape

Build a single-page, mobile-first web app with three bottom tabs:

1. AI帮选
2. 逛食堂
3. 抽一餐

Memory is not a standalone tab. It is shown inside AI帮选 and 抽一餐 as a compact, editable summary of what the AI has remembered.

## First Version Tech Direction

Preferred stack:

- Next.js
- TypeScript
- Tailwind CSS
- Next.js API Routes / Route Handlers
- Local static data first
- localStorage for memory and client-side feedback state

Do not require Supabase, a vector database, authentication, or external services for the first working demo.

If an AI API key is unavailable, the app must still work using mock recommendation logic.

## Core Features

Must implement:

- AI帮选 tab:
  - Natural language input.
  - Quick condition chips.
  - Recommendation result cards.
  - Reason, risk, and evidence for each recommendation.
  - Memory summary integrated into the page.
  - Follow-up actions such as 换一批, 再便宜点, 不要面食, 太辣, 偏咸.

- 逛食堂 tab:
  - Search by food, canteen, stall, or tag.
  - Filter chips.
  - Food list.
  - Food detail sheet/modal.
  - Like, dislike, quick feedback tags, and short comment display.

- 抽一餐 tab:
  - Draw three cards:
    - 稳妥卡
    - 探店卡
    - 惊喜卡
  - Draw logic should respect memory avoid tags, recent foods, and avoid foods.
  - "就吃这个" should update recent foods.

- Data and AI logic:
  - At least 30 simulated campus food records.
  - Simulated feedback for most food records.
  - Lightweight RAG retrieval using rule scoring and keyword/tag matching.
  - LLM rerank if API key exists.
  - Mock rerank fallback if API key is missing.
  - Whitelist validation so recommendations only reference existing food IDs.
  - memoryPatch returned from recommendation and merged into localStorage.

## Explicit Non-Goals

Do not build these unless the user explicitly changes scope:

- Login or registration.
- Merchant/admin backend.
- Payment, ordering, delivery, queueing, or inventory.
- Real map API.
- Full social feed.
- Comment replies or threaded discussion.
- Points, tokens, badges, or card collection system.
- Native app or WeChat Mini Program.
- Supabase or other external database as a requirement.
- Vector database as a requirement.
- Complex LangChain agent.
- Nutrition or medical advice claims.

## RAG Rules

The first version uses lightweight RAG:

1. Convert each food item and its feedback into a retrievable knowledge text.
2. Parse user query with simple keyword/rule extraction.
3. Merge user memory.
4. Score foods by price, tags, distance, feedback, recent foods, and avoid foods.
5. Select top candidates.
6. Let LLM rerank and explain only if API key is available.
7. Validate returned food IDs against the candidate whitelist.
8. Fall back to deterministic top-scoring foods if LLM fails.

Do not let the model invent food names, prices, canteens, stalls, locations, or comments.

## Memory Rules

Memory is generated automatically from:

- User recommendation queries.
- Follow-up actions.
- Recommendation feedback.
- Food detail feedback.
- Draw-card selection.

Memory is stored in localStorage under:

```text
seu-eat-memory
```

Use a fixed structure:

```ts
type UserMemory = {
  budgetMax?: number
  preferTags: string[]
  avoidTags: string[]
  recentFoods: string[]
  avoidFoods: string[]
  preferredCanteens: string[]
  sessionContext: string[]
  updatedAt: string
}
```

Memory must remain transparent and editable. The UI should show what the AI has remembered and allow deleting chips or clearing memory.

Do not infer sensitive identity, health status, wealth, personality, or hidden user traits. Only store food-related preferences that the user expressed or confirmed.

## Recommended File Structure

If using Next.js:

```text
app/
  page.tsx
  api/
    recommend/
      route.ts
    parse-menu/
      route.ts

components/
  AppShell.tsx
  BottomTabs.tsx
  ui/
    Chip.tsx
  ai/
    AiRecommendTab.tsx
    MemorySummary.tsx
    RecommendationCard.tsx
  explore/
    ExploreTab.tsx
  draw/
    DrawMealTab.tsx

data/
  foods.ts
  feedback.ts

lib/
  data.ts
  feedback.ts
  memory.ts
  rag.ts
  recommend.ts
  draw.ts
  deepseek.ts
  mock-ai.ts

types/
  index.ts
```

Keep files focused. Do not put all UI, data, RAG, and memory logic into one large component.

## UI Direction

Mobile-first.

Visual keywords:

- Light campus utility.
- Clean food decision tool.
- Clear cards.
- Strong evidence display.
- Playful but not gamified.

Use:

- Green as primary action color.
- Tomato red for price/risk emphasis.
- Warm yellow for warnings/tips.
- Light gray-green background.
- White cards with thin borders and small radius.

Avoid:

- Marketing landing page.
- Large hero section.
- Full-screen gradients.
- Heavy food social app style.
- Excessive decorative effects.
- Dense desktop dashboard.

## Demo Path

The app should support this 3-minute demo:

1. Open AI帮选.
2. Enter:

```text
15元以内，清淡，不要太咸，离教学楼近
```

3. Show 3 recommendations with reason, risk, and evidence.
4. Click feedback such as 偏咸 or 不喜欢.
5. Show memory updated.
6. Open 逛食堂, search 清淡, open a food detail, give feedback.
7. Open 抽一餐 and draw 稳妥卡 / 探店卡 / 惊喜卡.
8. Click 就吃这个 and show recentFoods updated.

## Stability Requirements

- The app must work without a real AI key.
- The app must not recommend nonexistent foods.
- The app must have deterministic fallback recommendations.
- The main demo path should run without network access after dependencies are installed.
- Keep mock data realistic enough for presentation.

## Development Order

1. Build data and types.
2. Build app shell and three tabs.
3. Build explore search/detail/feedback.
4. Build AI recommendation UI with mock results.
5. Build RAG scoring and `/api/recommend`.
6. Build memory integration.
7. Build draw-card logic.
8. Polish the main demo path.
9. Add parse-menu demo only if core flow is stable.

## Testing Commands

When the project exists, prefer these checks:

```bash
npm run lint
npm run build
npm run dev
```

If custom test scripts are added, document them here.

## Agent Behavior Rules

- Always preserve the three-tab product shape unless explicitly told otherwise.
- Prioritize demo stability over feature expansion.
- If an external API fails, provide a mock fallback.
- If data is missing, create realistic simulated data.
- Keep recommendation outputs grounded in food IDs from local data.
- Do not add banned features.
- Do not refactor unrelated files.
- Do not introduce a database or auth unless asked.
- Update this file if the project structure or commands change.
