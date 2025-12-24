# 调试登录接口说明

本说明记录了调试版登录 API 及相关调试账号数据。

## 新增接口
- `POST /api/debug/login`
  - 请求体：`{ "username": "1P|2P|3P", "password": "<任意>" }`
  - 逻辑：不校验密码、不查库，直接按用户名映射角色并签发 JWT、写入同名 Cookie。
    - `1P` -> `ADMIN`
    - `2P` -> `PATIENT`
    - `3P` -> `DOCTOR`
  - 响应：与正常登录一致的 `AuthResponse`（`token`, `username`, `role`）。

## 调试账号与数据（DataInitializer 自动写入）
- 管理员：`username=1P`，角色 ADMIN
- 病人：`username=2P`，角色 PATIENT，附带 1 条挂号与 1 条病历记录（疾病、医生均已创建）
- 医生：`username=3P`，角色 DOCTOR，所在科室“内科”

> 提示：首次或需要重置调试数据时，启动后端时添加 `--force-init` 以清空并重建数据。
