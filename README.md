# 🎾 Crazy in Love Tennis Club — Web App

会员专属球场预约系统，基于 React 构建，可直接部署到网页。

---

## 📁 项目结构

```
citlc-react/
├── public/
│   └── index.html          ← 网页入口
├── src/
│   ├── data/
│   │   └── data.js         ← 球场、会员、预约数据（上线后换成 API）
│   ├── components/
│   │   ├── Navbar.jsx      ← 顶部导航栏
│   │   ├── Navbar.css
│   │   ├── Modal.jsx       ← 时段详情弹窗
│   │   └── Modal.css
│   ├── pages/
│   │   ├── AuthPage.jsx    ← 登录 / 注册页
│   │   ├── AuthPage.css
│   │   ├── HomePage.jsx    ← 首页（选球场）
│   │   ├── HomePage.css
│   │   ├── BookingPage.jsx ← 三步预约流程
│   │   ├── BookingPage.css
│   │   ├── SchedulePage.jsx← 时刻表（点击查看是谁预约的）
│   │   ├── SchedulePage.css
│   │   ├── MyBookingsPage.jsx ← 我的预约历史
│   │   └── MyBookingsPage.css
│   ├── App.jsx             ← 根组件（管理所有状态）
│   ├── index.css           ← 全局样式
│   └── index.js            ← 程序入口
└── package.json
```

---

## 🚀 第一次运行（本地预览）

### 第一步：安装 Node.js
前往 https://nodejs.org 下载并安装 **LTS 版本**（推荐 v20）。
安装完后打开终端（Mac 用 Terminal，Windows 用 PowerShell）验证：
```bash
node -v   # 应显示 v20.x.x
npm -v    # 应显示 10.x.x
```

### 第二步：进入项目文件夹
```bash
cd citlc-react
```

### 第三步：安装依赖（只需运行一次）
```bash
npm install
```

### 第四步：启动本地开发服务器
```bash
npm start
```
浏览器会自动打开 http://localhost:3000，即可看到应用。

---

## 🌐 部署上线（免费方案）

### 方案 A — Vercel（推荐，最简单）
1. 前往 https://vercel.com 注册免费账号
2. 点击 "Add New Project" → 上传或连接 GitHub 仓库
3. 框架选 "Create React App"，直接点 Deploy
4. 几分钟后获得一个 https://xxx.vercel.app 的网址，发给会员即可使用

### 方案 B — Netlify
1. 先在本地运行 `npm run build`，生成 `build/` 文件夹
2. 前往 https://netlify.com，把 `build/` 文件夹拖拽上传
3. 即可获得免费网址

---

## ✏️ 常见自定义修改

| 想改什么 | 修改哪个文件 |
|---------|------------|
| 球场数量和名称 | `src/data/data.js` → `COURTS` |
| 可预约时间段 | `src/data/data.js` → `TIME_SLOTS` |
| 会员信息 | `src/data/data.js` → `MEMBERS` |
| 颜色主题 | `src/index.css` → `:root` 里的变量 |
| 俱乐部名称 | `src/components/Navbar.jsx` 和 `public/index.html` |

---

## 📌 下一步功能建议

- **真实数据库**：接入 Supabase（免费）替换 `data.js` 模拟数据
- **用户认证**：接入 Supabase Auth 实现真实登录注册
- **在线支付**：集成支付宝 / 微信支付
- **短信通知**：预约成功后发送确认短信
- **管理员后台**：管理所有预约、会员资料

如需帮助，可以继续向 Claude 提问！
