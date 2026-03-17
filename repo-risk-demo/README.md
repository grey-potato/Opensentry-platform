# Repo Risk Demo UI

这是一个零依赖静态原型，用于演示“首页仓库总览入口 + 单仓库风控视图”的信息架构与跳转链路。

## 如何查看

1. 直接在浏览器打开 `index.html`。
2. 或在 VS Code 里使用 Live Server 打开。

## 已覆盖页面

- Home
- Overview
- Commits
- Issues
- PRs
- Users/Contributors
- Risk
- Commit/Issue/PR/User 详情页
- 全局搜索结果页

## 单仓库 Overview 增强

- 顶部展示仓库核心 metadata（仓库名、默认分支、语言、许可、首次纳管、最近同步等）。
- 下方展示周级时序图（最近 8 周）：提交数、新开 Issue、合并 PR、活跃贡献者。
- 用于模拟“数据库按周维护”的趋势感知场景。

## 首页策略

- 首页展示多个仓库卡片，不直接进入单仓库详情。
- 支持按 Star 排序与随机探索两种入口视图。
- 点击仓库后进入该仓库的 Overview，再在仓库内继续浏览 Commits/Issues/PRs/Users/Risk。

## 已覆盖跳转链路

- Overview -> Commits/Issues/PRs/Users/Risk
- Commit/Issue/PR 详情 -> User 详情
- User 详情 -> 用户相关 Commit/Issue/PR 过滤视图
- Risk 实体列表 -> 对应详情页
- 全局搜索 -> 对应实体详情
- 首页可按仓库名/描述搜索并进入目标仓库
