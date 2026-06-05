# 东南今天吃点啥：项目详细设计

## 1. 项目定位

**东南今天吃点啥** 是一个移动端优先的 AI 饭点决策助手。它把校园菜单、学生反馈和用户饮食偏好结合起来，帮助学生在饭点快速决定今天吃什么。

一句话：

> 基于本校真实或模拟菜品、学生反馈和个人偏好的 AI 饭点决策助手。

项目不是：

- 校园食堂推荐系统的传统大平台。
- 校园版大众点评。
- 点餐/外卖/支付系统。
- 商家后台系统。
- 完整社区产品。
- 健康营养医疗建议产品。

项目是：

- 一个高频校园场景工具。
- 一个 30 秒饭点决策助手。
- 一个轻量 RAG + memory 的 AI hackathon demo。
- 一个可搜索、可反馈、可抽卡的移动端 Web App。

## 2. 核心用户和场景

目标用户：

- 校园学生。
- 对食堂不熟的人。
- 饭点选择困难的人。
- 想快速找到符合预算、口味、距离的菜品的人。

核心场景：

1. 用户有明确需求：
   - "15 元以内，清淡，不要太咸，离教学楼近。"
   - 使用 AI帮选。

2. 用户想自己找：
   - 搜索菜品、食堂、窗口。
   - 查看评论、点赞和标签。
   - 使用 逛食堂。

3. 用户完全不想想：
   - 点击抽卡。
   - 获得稳妥卡、探店卡、惊喜卡。
   - 使用 抽一餐。

## 3. 产品形态

第一版做：

```text
移动端优先 Web App
单页面应用
底部三 Tab：
1. AI帮选
2. 逛食堂
3. 抽一餐
```

Memory 不做独立 Tab。它作为 AI 推荐和抽卡的一部分展示。

推荐页面不是完整聊天流，而是：

> 单轮主推荐 + 快捷追问 + 推荐结果刷新。

## 4. 核心闭环

```text
用户搜索/浏览
-> 点赞、踩、标签、短评
-> 形成校园餐饮知识库
-> RAG 检索候选菜品
-> LLM 或 mock rerank 推荐 3 个菜
-> 用户反馈
-> 更新 memory 和反馈数据
-> 下一次推荐更贴合
```

评论点赞不是装饰，它们是 RAG 推荐的数据来源。

## 5. 功能范围

### 5.1 P0 必须完成

- 单页面三 Tab。
- 至少 30 条模拟菜品数据。
- 模拟反馈数据。
- AI帮选自然语言输入。
- 快捷条件 chips。
- 推荐 3 个菜品。
- 推荐理由、风险、证据展示。
- memory 摘要展示。
- 逛食堂搜索和筛选。
- 菜品详情弹窗。
- 点赞、踩、快速反馈标签。
- 抽一餐三张卡。
- localStorage memory。
- 无 API key 时 mock 推荐可用。

### 5.2 P1 有余力再做

- 短评输入。
- 推荐结果快捷追问。
- 菜单结构化 demo。
- AI 生成抽卡理由。
- 更精致的抽卡动效。

### 5.3 不做

- 登录注册。
- 商家端。
- 真实地图。
- 支付、下单、排队。
- 积分和卡牌收藏。
- 评论回复。
- 完整社区流。
- Supabase 必选。
- 向量数据库必选。
- 原生 App 或微信小程序。

## 6. UI 设计

视觉关键词：

- 干净。
- 轻量。
- 校园工具感。
- 饭点决策效率。
- 有一点趣味，但不游戏化。

主色：

- 绿色：主要操作、确认、推荐。
- 番茄红：价格、风险。
- 暖黄：提示。
- 浅灰绿/米白：背景。
- 白色卡片：信息承载。

### 6.1 AI帮选

页面结构：

```text
今天吃什么？
基于真实菜单和同学反馈

[自然语言输入框]
[15元内] [清淡] [不辣] [高蛋白] [离我近]

MemorySummary:
已参考：不吃辣、少油、最近吃过鸡排饭

[帮我推荐]

推荐结果：
Food Recommendation Card x 3
```

推荐卡内容：

- 菜名。
- 食堂和窗口。
- 价格。
- 距离提示。
- 标签。
- 推荐理由。
- 可能风险。
- 证据来源。
- 操作按钮：
  - 就吃这个。
  - 不喜欢。
  - 再便宜点。
  - 不要面食。
  - 离我更近。

### 6.2 逛食堂

页面结构：

```text
自己逛逛
[搜索菜品/食堂/窗口]
[食堂筛选] [价格筛选] [标签筛选]

热门/推荐列表
菜品列表
菜品详情弹窗
```

菜品详情内容：

- 菜名。
- 食堂。
- 窗口。
- 价格。
- 位置。
- 标签。
- 点赞/踩。
- 高频反馈标签。
- 短评展示。
- 快速反馈按钮。

### 6.3 抽一餐

页面结构：

```text
今天不想纠结？
从校园菜品库里抽 3 个选择。

已避开：偏辣、偏咸、最近吃过

[开始抽卡]

稳妥卡
探店卡
惊喜卡
```

卡片类型：

- 稳妥卡：
  - 点赞高。
  - 低踩。
  - 符合 memory。
  - 不容易踩雷。

- 探店卡：
  - 用户最近没吃过。
  - 不一定最热门。
  - 反馈还不错。
  - 鼓励换个窗口。

- 惊喜卡：
  - 随机性更强。
  - 仍避开硬忌口。
  - 可以轻微偏离偏好。

## 7. 数据模型

### 7.1 Food

```ts
export type Food = {
  id: string
  name: string
  canteen: string
  stall: string
  price: number
  location: string
  distanceLevel: "near" | "medium" | "far"
  tags: string[]
  taste: string
  description: string
  image?: string
}
```

推荐标签池：

```ts
[
  "清淡",
  "偏辣",
  "不辣",
  "偏咸",
  "少油",
  "油腻",
  "高蛋白",
  "碳水足",
  "热汤",
  "面食",
  "米饭",
  "素食",
  "肉类",
  "出餐快",
  "量大",
  "性价比高",
  "适合减脂",
  "容易卖完"
]
```

### 7.2 FoodFeedback

```ts
export type FoodFeedback = {
  foodId: string
  likes: number
  dislikes: number
  tagVotes: Record<string, number>
  comments: string[]
}
```

### 7.3 UserMemory

```ts
export type UserMemory = {
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

localStorage key:

```text
seu-eat-memory
```

### 7.4 Recommendation

```ts
export type Recommendation = {
  foodId: string
  score: number
  reason: string
  risk: string
  evidence: string[]
}
```

### 7.5 DrawCard

```ts
export type DrawCard = {
  type: "safe" | "explore" | "surprise"
  title: string
  foodId: string
  reason: string
}
```

## 8. RAG 设计

第一版使用轻量 RAG，不使用向量数据库。

流程：

```text
用户 query
+ memory
-> parseQuery
-> buildRagDocument for each food
-> scoreFoods
-> retrieve Top 8 candidates
-> LLM rerank if API key exists
-> mock rerank fallback
-> whitelist validation
-> return recommendations + memoryPatch
```

### 8.1 RAG 文档

每个菜品自动拼接：

```text
菜品：番茄鸡蛋盖饭
食堂：桃园食堂
窗口：二楼盖浇饭窗口
价格：12元
位置：桃园食堂二楼东侧，距离较近
标签：清淡、不辣、高蛋白、米饭、出餐快
口味：酸甜清淡
描述：酸甜口，出餐较快，适合午餐
学生反馈：18人点赞，3人不推荐；高频反馈：出餐快、性价比高、偏咸
短评：番茄味比较足，不辣；中午排队不算久；有时候会偏咸
```

### 8.2 规则打分

加分：

- 命中用户偏好标签。
- 命中 query 关键词。
- 价格符合预算。
- 距离符合。
- 点赞高。
- 正向反馈标签多。

扣分：

- 命中 avoidTags。
- 超预算。
- 最近吃过。
- 在 avoidFoods。
- dislikes 高。
- 负向反馈多。

### 8.3 LLM 约束

LLM 只能从候选菜品中推荐。

禁止：

- 编造菜名。
- 编造价格。
- 编造食堂。
- 编造窗口。
- 编造评论。
- 推荐候选之外的食物。

如果 LLM 输出失败，使用本地 top 3 候选作为 fallback。

## 9. Memory 设计

Memory 不是用户手动填写为主，而是从对话和反馈中自然提取。

来源：

- 用户输入推荐需求。
- 用户点击追问按钮。
- 用户点击不喜欢/太辣/偏咸。
- 用户点击就吃这个。
- 抽卡选择。
- 菜品详情反馈。

推荐接口返回：

```ts
memoryPatch: Partial<UserMemory>
```

前端校验并合并到 localStorage。

UI 展示：

```text
已参考：不吃辣、15元以内、最近吃过鸡排饭
```

用户可以：

- 删除某个 memory chip。
- 清空 memory。

隐私边界：

- 只保存饮食相关显式偏好。
- 不推断身份、健康、消费能力、性格。

## 10. 抽一餐设计

抽卡不调用 AI，第一版用规则实现。

过滤规则：

- 排除 avoidFoods。
- 降权 recentFoods。
- 避开 avoidTags。
- 尽量参考 budgetMax。

三类卡：

1. 稳妥卡
   - 从高点赞、低 dislike、符合偏好的菜里抽。

2. 探店卡
   - 从用户少吃过、非最热门但反馈不错的菜里抽。

3. 惊喜卡
   - 从剩余菜里随机，仍避开硬忌口。

选中后：

- 点击 "就吃这个"。
- 将 foodId 加入 recentFoods。

## 11. API 设计

### 11.1 POST /api/recommend

Request:

```ts
type RecommendRequest = {
  query: string
  memory: UserMemory
  session: {
    previousRecommendations: string[]
    currentConstraints: string[]
  }
}
```

Response:

```ts
type RecommendResponse = {
  resolvedIntent: {
    summary: string
    constraints: string[]
  }
  recommendations: Recommendation[]
  memoryPatch: Partial<UserMemory>
}
```

Behavior:

- Run local retrieval.
- Use real LLM if API key exists.
- Use mock rerank otherwise.
- Validate all returned food IDs.
- Return deterministic fallback on failure.

### 11.2 POST /api/parse-menu

P1 optional.

Request:

```ts
type ParseMenuRequest = {
  menuText: string
}
```

Response:

```ts
type ParseMenuResponse = {
  items: {
    name: string
    price?: number
    tags: string[]
    spicy: "yes" | "no" | "unknown"
    notes: string
  }[]
}
```

## 12. Recommended Code Structure

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

## 13. Development Order

Single-developer order:

1. Create project and styling foundation.
2. Add types and simulated data.
3. Build app shell and bottom tabs.
4. Build 逛食堂 first because it validates the data.
5. Build AI帮选 UI with mock recommendations.
6. Build RAG scoring and recommendation API.
7. Build memory read/write/merge.
8. Build 抽一餐.
9. Polish the demo path.
10. Add parse-menu only if core path is stable.

## 14. Demo Script

3-minute path:

1. Open AI帮选.
2. Query:

```text
15元以内，清淡，不要太咸，离教学楼近
```

3. Show three recommendations.
4. Point out reason, risk, and evidence.
5. Click feedback such as 偏咸 or 不喜欢.
6. Show memory updated.
7. Open 逛食堂, search 清淡, open a food detail, add feedback.
8. Open 抽一餐, draw 稳妥卡/探店卡/惊喜卡.
9. Click 就吃这个, show recentFoods updated.
10. Close with:

```text
这不是让 AI 凭空猜你想吃什么，而是基于校园真实菜单、同学反馈和个人偏好的饭点决策助手。
```

## 15. External References

参考方向：

- CampusFoodAgent:
  - 规则初排。
  - LLM rerank。
  - 白名单防幻觉。
  - fallback。

- TigerMenus:
  - 校园食堂工具应保持简单、高频、轻量。

- Food-recommender:
  - RAG pipeline 思路。

- MenuAI:
  - 菜单文本/图片结构化进入推荐知识库的技术叙事。

不要 fork 这些项目。只借思路。

## 16. Success Criteria

完成后应满足：

- App can run locally.
- Works without real AI key.
- Three tabs are usable.
- Recommendations only reference existing foods.
- Search and feedback work.
- Memory visibly updates.
- Draw-card flow works.
- Main demo path is stable.
- UI looks like a polished mobile web app, not a rough admin page.
