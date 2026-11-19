# 人员信息管理系统 — 前端（Vue2）

> AGENTS.md：会话工作目录在本项目内时自动加载。最后更新：2026-11-13

## 定位

- 路径：`D:\AAAprojects\RuoYi-Vue2`
- Vue 2.6.12 + Element UI 2.15.14 + Vue CLI 4.4.6，Vue Router **history 模式**
- 同一套前端对接两个后端：`D:\AAAprojects\RuoYi-Vue`（Boot 2.5.15）与 `D:\AAAprojects\RuoYi-Vue4`（Boot 4.0.3），接口契约一致，**无需为后端版本改前端**。

## 关键目录

```
src/views/login.vue              统一登录（调 /api/unified/login，按 type 跳转）
src/views/register.vue           若依自带注册（未启用）
src/views/ext/register.vue       外部邮箱注册
src/views/ext/compare/index.vue  比对组件（props.mode: ext/admin）
src/views/ext/ips/index.vue      我的IP授权
src/views/compare/ipUser|ipAuth|accessLog/index.vue   管理端三页
src/views/index.vue              后台首页（大标题 + 内嵌比对）
src/layout/ExtLayout.vue         外部用户布局
src/api/ext|compare/*.js         接口封装
src/utils/request.js             Admin-Token（Authorization Bearer）
src/utils/extRequest.js          X-Ext-Token（401 清 token 跳登录）
src/router/index.js              /ext/* 静态路由
src/permission.js                ext_token 守卫
```

## 开发与构建

```powershell
cd D:\AAAprojects\RuoYi-Vue2
$env:NODE_OPTIONS = '--openssl-legacy-provider'   # Node 22 必须，否则 OpenSSL 报错
npm.cmd run dev -- --port 82                      # 80/81 被系统或 Steam++ 占用
npm.cmd run build:prod                            # 产物 dist/
```

代理：`/dev-api` → `http://localhost:8080`（在 `vue.config.js`，改后端端口需同步改这里）。

## 约定与坑

- 权限按钮用 `v-hasPermi="['compare:xxx:yyy']"`，权限串必须与后端 `@PreAuthorize` 和后端 `sys_menu.perms` 三方一致。
- 外部页面必须走 `extRequest`（带 `X-Ext-Token`），管理端页面走 `request`（带 Admin-Token）。
- 已知死代码：`src/views/compare/person/index.vue`（无路由）、`src/views/ext/login.vue`（`/ext/login` 已重定向 `/login`），改动时别被误导。
- 路由是 history 模式，生产 Nginx 需 `try_files $uri $uri/ /index.html`。
- 首页固定渲染 `<ext-compare mode="admin">`，需要 `compare:person:query` 权限；非超管角色登录后台首页会 403。
- 表格/分页/弹窗沿用若依风格（`el-table` + `pagination` + `el-dialog`），不要引入新 UI 库。
- 系统标题、页脚在 `.env.*` 与 `src/settings.js`；不要再出现"若依"字样。

## 改页面的标准流程

1. 定位：`src/views/...` → 对应 `src/api/...` → 路由/菜单（`sys_menu`）。
2. 改完 `npm run build:prod` 必须成功（Node 22 记得 NODE_OPTIONS）。
3. 冒烟：`http://127.0.0.1:82/login` 登录后走一遍页面；接口层用 `/dev-api` 代理验证。
4. 结果追加到 `C:\Users\Administrator\OneDrive\Desktop\人员信息比对平台_执行记录.txt`。
