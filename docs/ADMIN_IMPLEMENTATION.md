# Admin 功能实现说明

## 新增/调整
- 后端新增 `AdminController` (`/api/admin/stats`) 提供仪表盘/统计数据：
  - 总用户/医生/患者/疾病/科室数量
  - 今日挂号、本月挂号
  - 按科室的挂号数量列表
  - 最近挂号列表（最近 8 条）
- 新增 DTO：`AdminStatsResponse`、`RecentRegistrationDto`。
- 无数据库表结构变更。

## 前端改动（admin）
- 登录状态沿用现有认证，直接调用后端接口：
  - 仪表盘：`Dashboard.tsx` 调用 `/api/admin/stats`，展示各项计数、科室挂号统计、最近挂号。
  - 用户管理：`UserManagement.tsx` 调用 `/api/users`，支持角色/搜索过滤（只读列表）。
  - 科室管理：`DepartmentManagement.tsx` 调用 `/api/admin/stats` 的科室统计，展示科室挂号量（只读）。
  - 挂号管理：`RegistrationManagement.tsx` 调用 `/api/registrations`，按状态/关键词过滤（只读列表）。
  - 排班管理：`ScheduleManagement.tsx` 基于未来的挂号记录展示即将到来的排班（只读）。
  - 统计页：`Statistics.tsx` 复用 `/api/admin/stats` 数据（只读）。
- 新增前端服务 `src/services/adminService.ts` 统一封装以上接口。

## 未实现/限制
- 用户、挂号、排班等页面目前为只读列表，未提供新增/编辑/删除操作。
- 科室管理未提供增删改，仅展示统计数据。
- 无独立排班表，排班视图基于未来挂号记录生成。
- 若需重置数据以体验效果，可在后端启动时使用 `--force-init` 重新种子数据。
