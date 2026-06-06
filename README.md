# SEU Eat App

东南 er 今天吃啥，是一个面向校园场景的移动端选饭助手。项目以东南大学九龙湖校区食堂为原型，结合真实店铺、真实菜品、用户反馈、个人偏好记忆和 AI 推荐，帮助学生在“今天吃什么”这个高频小决策上更快得到靠谱选择。

这个项目最初为黑客松 demo 设计，因此重点不是做一个复杂后台系统，而是在有限时间内打磨一个完整、可演示、可多人访问的校园产品雏形。

## 核心功能

- `AI 帮选`：用户用自然语言描述需求，例如“15 元以内，清淡，离教学楼近”，系统会结合菜品库、偏好记忆、近期反馈和 RAG 证据给出 3 个推荐。
- `逛食堂`：按食堂、窗口、菜品三层浏览真实校园菜单，支持搜索、标签筛选、分页和菜品详情。
- `抽一餐`：随机抽出稳妥卡、探店卡、惊喜卡，适合用户不想纠结时快速决定。
- `游客账号`：提供游客 A/B/C/D，一键进入，方便现场演示和多人试用。
- `偏好记忆`：首次进入可选择回答饮食偏好、住宿区域、上课区域等问题，也可以跳过；后续 AI 会从用户操作和对话中沉淀偏好。
- `社区反馈`：支持菜品和窗口的点赞、不推荐、标签反馈、短评展示。
- `我的面板`：记录最近吃过、收藏菜品、个人 memory、偏好和不再推荐等本地个人数据。
- `活动提醒`：展示食堂活动信息，未读时用红点提示。

## 数据范围

当前版本接入了真实校园菜单数据：

- 3 个食堂：桃园食堂、橘园食堂、湖滨餐厅
- 26 个窗口/店铺
- 256 个菜品
- 菜品图、窗口图、食堂示意图和松鼠 IP 视觉资源

缺失价格的菜品使用规则估价，并在描述中提示需要现场校对。

## AI 与 RAG

项目中的 AI 推荐不是简单包装大模型，而是采用轻量 RAG + memory 的方式：

1. 从本地真实菜品库中按预算、口味、距离、标签、食堂和窗口做候选召回。
2. 合并用户 memory、最近吃过、收藏、不再推荐、点赞/评论等反馈信号。
3. 为候选菜品生成可解释证据，例如价格、标签、窗口口碑、同学短评和不适合原因。
4. 如果配置了 DeepSeek API，则调用模型进行重排和生成推荐理由。
5. 如果没有配置 API，则自动使用本地 mock AI 兜底，保证演示不会崩。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest
- ESLint
- Supabase JS / Supabase SSR
- DeepSeek API，可选

## 目录结构

```text
src/
  app/                 Next.js 页面、API Routes、登录回调
  components/          AI、逛食堂、抽一餐、详情页、我的、活动等 UI 组件
  data/                菜品、活动、反馈、窗口图片等静态数据
  lib/                 推荐、RAG、memory、反馈存储、游客账号、Supabase 等逻辑
  types/               共享类型
public/
  real-food-assets/    真实菜品图和店铺图
  pipi/                松鼠 IP 图片资源
  canteen-illustrations/
docs/
  project-design.md
  ui-design-requirements.md
supabase/
  schema.sql
  migrations/
```

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

生产构建：

```bash
npm run build
npm run start
```

## 环境变量

项目可以无环境变量运行，此时 AI 和共享反馈会使用本地兜底逻辑。

可选 `.env.local`：

```bash
# DeepSeek, optional
DEEPSEEK_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-v3

# Supabase public auth, optional
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=

# Supabase server shared feedback, optional
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

注意：

- 不要把 `.env.local` 提交到仓库。
- `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端 API Route 中使用，不能加 `NEXT_PUBLIC_` 前缀。
- 如果 Supabase 不可用，前端会继续使用 localStorage 和本地反馈，保证 demo 可运行。

## Supabase 反馈表

共享反馈采用 append-only 事件表，迁移文件在：

```text
supabase/migrations/20260606050120_shared_feedback_events.sql
```

主要存储：

- 菜品点赞 / 不推荐
- 菜品标签反馈
- 菜品评论
- 窗口点赞 / 不推荐
- 窗口评论

个人数据仍保存在本地：

- memory
- 收藏
- 最近吃过
- 不再推荐
- 游客身份

## 常用命令

```bash
npm run test
npm run lint
npm run build
```

当前版本验证结果：

- Vitest: 60 个测试文件通过
- Tests: 174 个测试通过
- ESLint: 通过
- Next build: 通过

## 部署

项目可以部署到支持 Node.js 的平台，例如：

- 阿里云 ECS
- Vercel
- ModelScope Space
- 其他 Node.js 服务器

在普通服务器上的基本流程：

```bash
npm install
npm run build
npm run start
```

如果使用 PM2：

```bash
pm2 start npm --name seu-eat -- start
pm2 save
```

默认端口为 `3000`。如需公网访问，需要在服务器安全组和系统防火墙中放行对应端口，或用 Nginx 反向代理到 80/443。

## 设计文档

- [项目设计文档](docs/project-design.md)
- [UI 设计需求文档](docs/ui-design-requirements.md)
- [Supabase 共享反馈设计](docs/superpowers/specs/2026-06-06-supabase-shared-feedback-design.md)

## 项目定位

这个项目的目标不是替代大众点评或外卖平台，而是做一个更贴近校园场景的轻量决策工具：

- 菜品范围小而真实
- 推荐理由可解释
- 记住个人口味
- 能利用同学短评
- 现场网络或模型失败时仍可演示

一句话概括：让东南学生少纠结一分钟，多吃一顿合适饭。
