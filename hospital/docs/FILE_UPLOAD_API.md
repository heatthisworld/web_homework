# 文件上传 API 说明

- 路径：`POST /api/files/upload`
- Content-Type：`multipart/form-data`
- 表单字段：
  - `file`（必填）：上传的文件二进制内容
- 返回：`Result<FileUploadResponse>`
  - `originalName`：客户端文件名
  - `storedName`：服务端保存的随机文件名
  - `contentType`：MIME 类型（可能为空）
  - `size`：文件大小（字节）
  - `relativePath`：相对上传根目录的路径（示例 `2025-12-23/abcd1234.png`）
- 存储位置：保存到 `hospital/src/main/resources/files/<yyyy-MM-dd>/` 目录（如 `<项目根>/hospital/src/main/resources/files/2025-12-23/<随机名>`）。目录不存在会自动创建。
- 错误：
  - 空文件：`code=400`
  - IO 错误：`code=500`（包含错误信息）

## 前端访问/下载途径
- 已配置静态映射：`/files/**` 指向 `src/main/resources/files/`，上传后返回的 `relativePath` 可直接拼为 `GET /files/<relativePath>` 访问（示例 `/files/2025-12-23/abcd1234.png`）。
- 若调整存储目录，请同步修改 `WebConfig.addResourceHandlers` 和 `FileUploadController.ROOT`。
