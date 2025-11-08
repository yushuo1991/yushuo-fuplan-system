# 🌐 宇硕复盘图鉴 - 部署指南

## 🎯 让朋友们访问你的复盘图鉴

### 部署步骤

#### 1️⃣ Vercel部署（推荐）

**准备工作：**
```bash
# 构建项目
npm run build

# 初始化Git（如果还没有）
git init
git add .
git commit -m "准备部署到Vercel"
```

**GitHub准备：**
1. 访问 https://github.com 创建新仓库
2. 仓库名：`yushuo-fuplan-system`
3. 推送代码：
```bash
git remote add origin https://github.com/你的用户名/yushuo-fuplan-system.git
git branch -M main  
git push -u origin main
```

**Vercel部署：**
1. 访问 https://vercel.com
2. 用GitHub账号登录
3. 点击"Import Project"
4. 选择你的仓库
5. 配置如下：
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

**环境变量配置：**
在Vercel项目设置 → Environment Variables 添加：
```
VITE_SUPABASE_URL = 你的Supabase项目URL
VITE_SUPABASE_ANON_KEY = 你的Supabase Anon Key
VITE_ADMIN_USERNAME = admin
VITE_ADMIN_PASSWORD = 7287843
VITE_FAKE_EMAIL_DOMAIN = wx.local
```

**完成：**
- 自动获得访问地址：`https://你的项目名.vercel.app`
- 每次推送代码都会自动更新

---

### 🎉 朋友们如何访问

#### 朋友的使用流程：

1. **访问你的网站**
   - 你给朋友们分享：`https://你的项目名.vercel.app`

2. **注册账号**
   - 点击"立即注册"
   - 填写微信昵称（必须准确，用于后续联系）
   - 设置登录密码
   - 提交后显示"等待审批"页面

3. **等待你审批**
   - 朋友注册后会看到等待审批页面
   - 页面显示引流图片，提示联系你

4. **获得权限后登录**
   - 你审批后，朋友用昵称+密码登录
   - 自动跳转到复盘信息主页

---

### 👨‍💼 你的管理员操作

#### 审批新用户：

1. **查看注册用户**
   - 访问：`你的网站/admin/login`
   - 登录：admin / 7287843
   - 在管理后台看到所有注册用户

2. **给朋友分配权限**
   - 点击对应用户的时间按钮：
     - "1个月" - 30天访问权限
     - "3个月" - 90天访问权限  
     - "半年" - 180天访问权限
     - "1年" - 365天访问权限
     - "永久" - 永不过期

3. **权限管理**
   - 随时撤销用户权限
   - 延长到期时间
   - 删除不需要的用户

---

### 📱 分享给朋友的说明

**发给朋友的使用说明：**

> 🎯 **宇硕复盘图鉴访问指南**
> 
> **网址：** https://你的项目名.vercel.app
> 
> **注册步骤：**
> 1. 点击"立即注册"
> 2. 填写你的微信昵称（请准确填写）
> 3. 设置登录密码（记住密码）
> 4. 等待我审批通过
> 
> **登录方式：**
> - 用户名：你的微信昵称
> - 密码：注册时设置的密码
> 
> **注意事项：**
> - 昵称必须准确，后续用于登录
> - 注册后需要等待审批
> - 审批通过后即可正常使用
> 
> 有问题联系我！😊

---

### 🔧 高级配置（可选）

#### 自定义域名：
- 在域名商购买域名（如：fuplan.你的域名.com）
- 在Vercel项目设置中添加自定义域名
- 按提示配置DNS记录

#### HTTPS安全：
- Vercel自动提供HTTPS加密
- 数据传输安全可靠

#### CDN加速：
- Vercel全球CDN，访问速度快
- 支持国内外朋友访问

---

### 🛡️ 安全建议

1. **管理员账号安全**
   - 定期更改管理员密码
   - 不要在公开场合暴露admin登录地址

2. **用户权限控制**
   - 谨慎分配长期权限
   - 定期检查用户活跃度
   - 及时清理不活跃用户

3. **数据备份**
   - 定期备份Supabase数据
   - 保存项目代码备份

---

### 📊 用户管理建议

#### 分级权限策略：
- **好朋友**：永久权限
- **普通朋友**：6个月或1年
- **试用用户**：1个月
- **临时访客**：根据需要

#### 用户沟通：
- 建立微信群方便通知
- 定期告知系统更新
- 收集使用反馈

**🎉 部署完成后，你就有了一个专业的多用户复盘系统！**