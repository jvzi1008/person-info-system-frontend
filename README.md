# 人员信息管理系统 — 前端

> 基于 RuoYi-Vue2 3.9.2 二次开发的人员信息比对系统前端
> Vue 2.6 · Element UI 2.15 · Vue CLI 4

---

## 项目简介

配合同名后端仓库使用的人员信息核验界面。两类角色、两套布局：

| 角色 | 入口 | 页面 |
|---|---|---|
| 管理员 | 侧边栏后台 | 首页比对、用户审核、IP 授权、操作/登录/访问日志 |
| 普通用户 | `/ext/*` 外部布局 | 人员信息比对、我的 IP、我的登录日志 |

---

## 技术栈

| 组件 | 版本 |
|---|---|
| Vue | 2.6.12 |
| Element UI | 2.15.14 |
| Vue Router | 3.4.9（history 模式） |
| Vuex | 3.6.0 |
| Axios | 0.30.x |
| Vue CLI | 4.4.6 |
| Node.js | 18+（22 需加参数） |

---

## 快速开始

```powershell
npm install
$env:NODE_OPTIONS='--openssl-legacy-provider'   # Node 22 必须
npm run dev -- --port 82
```

访问 http://localhost:82/login

生产构建：

```powershell
npm run build:prod
```

产物在 `dist/`。

> 80 端口常被 Windows System 占用，81 可能被其他软件占用，建议用 82。

---

## 目录结构

```
src/
├─ api/
│  ├─ login.js              登录、验证码、统一登录
│  ├─ compare/              管理端接口
│  │  ├─ person.js          人员比对
│  │  ├─ ipAuth.js          IP 授权 + 审核
│  │  ├─ myIp.js            我的 IP
│  │  ├─ myLoginLog.js      我的登录日志
│  │  └─ accessLog.js       访问日志
│  └─ system/user.js        用户管理 + 审核
├─ layout/
│  ├─ index.vue             后台布局
│  └─ ExtLayout.vue         外部用户布局（顶栏导航 + 修改密码）
├─ views/
│  ├─ login.vue             统一登录页
│  ├─ register.vue          邮箱注册
│  ├─ index.vue             后台首页（内嵌比对）
│  ├─ ext/
│  │  ├─ compare/index.vue  比对页
│  │  ├─ ips/index.vue      我的 IP
│  │  └─ loginLog/index.vue 我的登录日志
│  ├─ compare/
│  │  ├─ ipAuth/index.vue   IP 授权管理
│  │  └─ accessLog/index.vue 访问日志
│  └─ system/user/index.vue 用户管理（含审核弹窗）
├─ router/index.js          静态路由（/ext/*）
├─ permission.js            路由守卫（普通用户限制在 /ext/*）
└─ utils/
   ├─ request.js            管理端 Axios（Admin-Token）
   └─ auth.js               Cookie Token
```

---

## 代理配置

`vue.config.js`：

```js
const baseUrl = 'http://localhost:8080'
proxy: {
  [process.env.VUE_APP_BASE_API]: {
    target: baseUrl,
    changeOrigin: true,
    pathRewrite: { ['^' + process.env.VUE_APP_BASE_API]: '' }
  }
}
```

- 开发环境 `VUE_APP_BASE_API = /dev-api`
- 生产环境 `VUE_APP_BASE_API = /prod-api`

后端换端口时需同步修改这里的 `baseUrl`。

---

## 页面说明

### 统一登录 `/login`

账号密码 + 验证码。登录后按角色分流：

- 管理员 → `/index`
- 普通用户 → `/ext/compare`

### 邮箱注册 `/register`

邮箱 + 密码 + 确认密码 + 验证码。
注册后状态为「待审核」，需管理员在「人员信息管理 → 用户审核」通过后才能登录。

### 人员信息比对

管理员在后台首页直接使用；普通用户在 `/ext/compare`。

输入证件号（必填）、姓名（选填），返回：

- 是否在读（是 / 否 / 未知 / 状态冲突）
- 是否中小学生或职业学生
- 是否有转学记录
- 学生结果明细、转学记录明细

### 我的 IP `/ext/ips`

查看、添加、删除自己的 IP 授权。新增 IP 需管理员审核通过后生效。

### 我的登录日志 `/ext/loginLog`

查看本人登录记录（时间、IP、地点、浏览器、状态、提示）。

### 用户审核

「人员信息管理 → 用户审核」，复用用户管理页并默认筛选「待审核」。

---

## 注意事项

- **Node 22** 运行 Vue CLI 4 必须设置 `NODE_OPTIONS=--openssl-legacy-provider`。
- **history 路由**：Nginx 生产部署需 `try_files $uri $uri/ /index.html`。
- **权限串**：按钮权限用 `v-hasPermi`，需与后端 `@PreAuthorize` 和
  `sys_menu.perms` 三方一致。
- 普通用户由 `permission.js` 守卫限制在 `/ext/*`，访问其他路径会重定向。

---

## 默认账号

| 账号 | 密码 | 说明 |
|---|---|---|
| admin | admin123 | 管理员 |
| test001 | Test1234 | 普通用户 |

---

## 说明

- 本项目基于 [RuoYi-Vue2](https://gitee.com/y_project/RuoYi-Vue)（MIT）二次开发，
  保留其布局、权限、字典等基础能力，并新增外部用户布局与管理端页面。
- 后端仓库：`person-info-system-backend`
