# 管理员账号紧急恢复指南

## 问题描述
管理员账号被误删，导致无法登录管理后台。

## 解决方案

### 🚨 **最快解决方法 - 通过Supabase控制台**

1. **登录Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择你的项目

2. **检查用户是否存在**
   - 进入 `Authentication` > `Users`
   - 查找 `admin@yushuo.local` 用户
   
3. **情况A: 用户还存在**
   - 复制用户的ID
   - 进入 `Table Editor` > `profiles` 表
   - 点击 `Insert` > `Insert row`
   - 填写:
     ```
     id: [复制的用户ID]
     wechat_nickname: admin  
     is_admin: true
     created_at: [当前时间]
     ```

4. **情况B: 用户被完全删除**
   - 在 `Authentication` > `Users` 点击 `Add user`
   - 填写:
     ```
     Email: admin@yushuo.local
     Password: 7287843
     Email Confirmed: ✅ true
     ```
   - 创建成功后复制用户ID
   - 进入 `Table Editor` > `profiles` 表添加记录(同情况A)

### 🛠️ **SQL修复方法**

在Supabase的SQL Editor中执行:

```sql
-- 1. 检查用户是否存在
SELECT id, email FROM auth.users WHERE email = 'admin@yushuo.local';

-- 2. 如果用户存在，使用其ID创建profiles记录
INSERT INTO public.profiles (id, wechat_nickname, is_admin, created_at)
VALUES (
  '替换为实际用户ID',  
  'admin',
  true,
  now()
);

-- 3. 验证恢复成功
SELECT p.id, p.wechat_nickname, p.is_admin, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true;
```

### 🔄 **临时方案 - 提升现有用户**

如果你有其他用户账号，可以临时将其提升为管理员:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE wechat_nickname = '你的昵称';
```

## 验证步骤

1. 完成恢复后，访问: `/admin/login`
2. 输入: `admin` / `7287843`
3. 应该能成功登录管理后台

## 预防措施

1. **不要在管理后台删除管理员账号**
2. **如果需要删除，先创建备用管理员**
3. **定期备份重要数据**

修复完成后管理员登录流程就会恢复正常！