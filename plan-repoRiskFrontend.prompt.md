## Plan: 开源仓库风险展示前台方案

基于 React + Next.js 构建“类 GitHub 但聚焦元数据与风险结果”的单仓库展示平台：首版覆盖 Overview、Commits、Issues、PRs、Users、Risk 六个页面，并补充首页展示与全局搜索。采用 SSR+CSR 混合与统一筛选体系，在不展示代码 diff 的前提下，完成 repo→实体列表→实体详情→用户详情的可追踪跳转闭环。

**Steps**
1. Phase 1 - 产品与信息架构冻结（阻塞后续）
1.1 明确首版边界：仅单仓库视图，不做跨仓库对比；风险仅展示结果（分数/等级/标签），不展示解释链路。  
1.2 冻结页面地图：Home、Repo Overview、Commits、Issues、PRs、Users/Contributors、Risk。  
1.3 冻结跳转图：Overview→Commits/Issues/PRs/Users/Risk；Commit/Issue/PR 详情→关联 User；User 详情→该用户相关 Commit/Issue/PR 过滤视图。  
1.4 冻结全局搜索范围：仓库内支持 SHA、Issue/PR 编号、标题关键词、用户名。

2. Phase 2 - 前端工程底座（依赖 Phase 1）
2.1 初始化 Next.js（App Router）工程与路由分层（仓库层路由 + 页面子路由）。  
2.2 建立通用布局：顶部仓库头、二级导航、全局筛选栏、主内容区。  
2.3 建立统一数据访问层：API Client、错误映射、分页与排序参数模型。  
2.4 接入 TanStack Query：Query Key 规范、缓存与失效策略、预取策略。  
2.5 建立 UI 基础组件：列表表格、状态标签、风险徽章、空态/错误态、移动端抽屉筛选。  
2.6 建立设计令牌（颜色、间距、字体、阴影、动效）与响应式断点，保证“桌面优先 + 移动可浏览”。

3. Phase 3 - 页面实现（可并行，依赖 Phase 2）
3.1 Home 页面：仓库入口、关键统计卡、快速搜索、最近活动摘要。  
3.2 Repo Overview：仓库 metadata + license + 风险总览 + 活跃度趋势 + 快捷跳转。  
3.3 Commits 页面：列表筛选（作者/时间/风险等级）+ 详情页（无 diff）+ 关联用户跳转。  
3.4 Issues 页面：状态/标签/风险筛选 + 详情页 + 关联用户与关联实体跳转。  
3.5 PRs 页面：状态/评审状态筛选 + 详情页 + 关联用户跳转。  
3.6 Users/Contributors 页面：贡献排行、用户基础画像、风险结果标签。  
3.7 Risk 页面：仓库风险总分、等级、标签分布、风险实体列表（可跳转到 Commit/Issue/PR/User）。

4. Phase 4 - 统一交互与可用性（并行于 Phase 3 后半段）
4.1 URL 状态化：筛选、分页、排序写入 query，支持分享与回退。  
4.2 全局搜索联动：在各页面自动带入搜索上下文。  
4.3 列表性能优化：分页优先，必要时引入虚拟滚动；输入防抖与请求取消。  
4.4 可访问性与易读性：键盘可达、颜色对比、风险标签语义化。  
4.5 移动端优化：卡片化列表、关键字段优先、详情页全屏展示。

5. Phase 5 - 观测与验收（依赖 Phase 3/4）
5.1 埋点：page_view、search_submit、filter_apply、sort_change、jump_to_detail。  
5.2 稳定性：页面级错误边界、接口失败重试与降级视图。  
5.3 测试：核心页面路由与查询参数、列表筛选、实体跳转、移动端基础浏览。  
5.4 性能验收：首屏加载、筛选响应、分页切换与弱网容错。  
5.5 UAT：按“从仓库到实体再到用户”的业务路径走查并签收。

**Relevant files**
- 当前工作区为空目录，本计划为实施蓝图。执行阶段建议先创建前端应用目录，再落地：路由层、页面层、组件层、数据访问层、样式令牌层、埋点层与测试层。

**Verification**
1. 功能完整性：6 大业务页 + 首页 + 搜索全部可访问，且互相跳转可闭环。  
2. 数据正确性：每页字段仅使用已存在后端数据（repo metadata/license/commit/issue/pr/user/profile/risk），且不出现代码 diff 展示。  
3. 交互一致性：筛选/排序/分页在 Commits、Issues、PRs、Users 页面行为一致。  
4. 响应式验收：移动端可完成“浏览仓库→查看实体列表→进入详情→跳转用户”的主链路。  
5. 质量门禁：关键路径端到端测试通过，页面错误率与加载性能达到团队基线。

**Decisions**
- 已确认：前端栈 React + Next.js。  
- 已确认：MVP 覆盖 Overview、Commits、Issues、PRs、Users、Risk，外加首页展示与搜索。  
- 已确认：移动端首版目标为“基础可浏览”，非完整深度交互。  
- 已确认：风险呈现首版仅展示结果（分数/等级/标签）。  
- 已确认：首版不做跨仓库能力，仅聚焦单仓库视图。

**Further Considerations**
1. 搜索交互建议：Option A 全局搜索框（跨页面统一）；Option B 各页面独立搜索；推荐 Option A。  
2. 详情展示建议：Option A 侧边抽屉（桌面效率高）；Option B 独立详情页（移动兼容好）；推荐桌面 A + 移动 B。  
3. 风险可视建议：Option A 仅标签+分数；Option B 增加趋势箭头；推荐首版使用 B（仍属“仅展示结果”范畴）。
