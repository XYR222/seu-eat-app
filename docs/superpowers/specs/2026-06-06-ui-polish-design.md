# UI Polish Design: Campus Meal Assistant

## Decision

Use **AI assistant-led design** as the main visual direction, borrow **restaurant review app density** for search/list pages, and keep **light card-draw playfulness** only in the draw tab.

This means:

- The app should feel like a polished mobile campus food tool.
- The AI tab should be the strongest first impression.
- The explore tab should feel efficient, searchable, and review-informed.
- The draw tab can be more playful, but must still feel grounded in real food data.

## Reference Patterns

Borrow from apps such as Dianping/Meituan at the pattern level only:

- Sticky or prominent search entry.
- Horizontal filter chips.
- Dense food cards with price, location, tags, and popularity.
- Ranking or "popular" modules.
- Bottom navigation with clear active state.
- Detail sheet for comments, likes, tags, and quick feedback.

Do not copy their brand colors, icon style, or marketplace-heavy feel.

## Visual Direction

Keywords:

- Clean.
- Warm.
- Food decision efficiency.
- Campus utility.
- Trustworthy AI.
- Slightly playful in draw mode only.

Palette:

- Background: warm off-white, not gray admin.
- Primary: fresh emerald/green for AI action and successful recommendation.
- Accent: warm orange/yellow for food energy and draw tab.
- Price/risk: tomato red.
- Surfaces: white cards with subtle borders and restrained shadow.
- Text: dark stone/near-black with muted secondary copy.

Avoid:

- Full-screen gradients.
- Large marketing hero.
- Purple/blue AI SaaS aesthetic.
- Heavy game styling across the whole app.
- Overly empty cards.
- Nested cards.

## Information Architecture

Keep the current three-tab product shape:

1. AI帮选
2. 逛食堂
3. 抽一餐

The bottom nav should look more like a real mobile app tab bar:

- Clear icon + label.
- Strong active state.
- Larger tap target.
- Slightly elevated surface.

## AI帮选 Tab

Goal: make this the project’s strongest demo screen.

Structure:

1. Compact app header:
   - Product name.
   - A small context badge such as "午饭高峰" or "AI 已参考偏好".

2. AI input panel:
   - Natural language text area.
   - Friendly prompt copy.
   - Quick condition chips.
   - Primary button: "生成 3 个选择".

3. Memory strip:
   - Integrated below the input, not visually isolated as a settings block.
   - Show "已参考" chips.
   - Keep clear/delete controls subtle.

4. Recommendation cards:
   - Rank badge: 推荐 1/2/3.
   - Food name, canteen/stall, price.
   - Match/reason section.
   - Risk section but visually secondary.
   - Evidence shown as compact bullets or chips.
   - Primary action: "就吃这个".
   - Secondary action: "不喜欢".
   - Feedback chips remain accessible but not visually noisy.

## 逛食堂 Tab

Goal: feel like a lightweight campus Dianping, not a plain database list.

Structure:

1. Header with title and short utility subtitle.
2. Prominent rounded search bar.
3. Horizontal filter chips.
4. Popular module:
   - Horizontal cards.
   - Rank number.
   - Likes/dislikes.
   - Price.
5. Food list:
   - Dense cards.
   - Price on the right.
   - Canteen/stall line.
   - Tags and feedback metrics.
   - Use small "同学反馈" or "热度" indicators.
6. Detail sheet:
   - More polished bottom sheet.
   - Large food title.
   - Price prominent.
   - Feedback tags.
   - Comments.
   - Like/dislike and quick tag actions.

## 抽一餐 Tab

Goal: memorable but controlled.

Structure:

1. Warm header panel with "不想纠结".
2. Show what memory avoids in one compact line.
3. Primary draw button.
4. Three card types:
   - 稳妥卡: green/trust.
   - 探店卡: orange/explore.
   - 惊喜卡: yellow/surprise.
5. Cards should still include real food facts:
   - Food name.
   - Canteen/stall.
   - Price.
   - Tags.
   - Reason.
   - "就它了" action.

Do not add collection, badges, points, or game inventory.

## Component-Level Changes

Create or refine shared UI primitives only if they simplify the implementation:

- `SectionHeader`
- `MetricPill`
- `FoodCard`
- `SearchBar`

Keep the scope small. Do not introduce a full design system.

## Implementation Scope

Must do:

- Improve global background, spacing, typography, card radii, and shadows.
- Redesign bottom tab bar.
- Polish AI input panel and recommendation cards.
- Polish memory strip.
- Polish explore search/filter/list/detail sheet.
- Polish draw card visual hierarchy.

Can do if low-cost:

- Add simple CSS-only press/hover states.
- Add small icon-like text symbols if no icon library exists.
- Improve empty states.

Do not do:

- Add a new icon package unless already available or clearly worth it.
- Add real images.
- Add animation-heavy card flipping.
- Change core recommendation logic.
- Add auth, database, or external service dependencies.

## Acceptance Criteria

- The app still works in the same three tabs.
- The main demo path remains unchanged.
- The UI looks intentionally designed on mobile width.
- Text does not overflow buttons or cards.
- Cards have clearer hierarchy than the current version.
- AI/reason/evidence value is easier to notice.
- Explore feels searchable and review-informed.
- Draw feels distinct but not like a separate game.
- `npm run lint`, `npm test`, and `npm run build` pass.
