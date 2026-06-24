# 赛锐锶科技官方网站

前后端分离的企业官网，面向大学生创新创业竞赛团队与高校教师。前端使用 React + Vite，后端使用 Express，生产环境可由同一个 Node 服务托管构建后的静态文件与 API。

## 本地开发

要求 Node.js 20+ 与 pnpm 9+。

```bash
pnpm install
pnpm dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

### Windows 一键演示

直接双击根目录中的 `一键演示官网.bat`。脚本会自动安装依赖、构建网站、启动服务并打开浏览器。演示结束后双击 `停止演示.bat`。

## 生产运行

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

构建后访问 `http://localhost:3001`。咨询表单会写入 `backend/data/leads.json`，正式部署建议将该目录挂载为持久化磁盘，或替换为 MySQL/PostgreSQL。

## 部署建议

可直接部署到 Railway、Render、阿里云轻量应用服务器或腾讯云轻量服务器。

仓库已包含 `render.yaml` 和 `Dockerfile`，Render 可直接识别蓝图，其他支持 Docker 的平台也可直接构建。

- 构建命令：`pnpm install --frozen-lockfile && pnpm build`
- 启动命令：`pnpm start`
- Node 版本：20 或更高
- 服务端口：读取环境变量 `PORT`
- 可选环境变量：`CORS_ORIGIN`

## 上线前替换

1. 确认公司正式联系电话、微信、邮箱和备案信息。
2. 提供可公开使用的真实奖项证明与案例资料，替换当前脱敏案例。
3. 将 `backend/data/leads.json` 切换为生产数据库或挂载持久化磁盘。
4. 配置正式域名、HTTPS 与 ICP 备案号。
<!-- merge marker removed -->
