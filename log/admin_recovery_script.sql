-- 管理员账号紧急恢复脚本
-- 时间: 2025-09-05
-- 问题: 管理员账号被误删，需要重新创建和授权

-- 方法1: 如果管理员用户还在auth.users表中，只需恢复profiles记录
-- 查询admin@yushuo.local是否还在auth.users中
-- SELECT id, email FROM auth.users WHERE email = 'admin@yushuo.local';

-- 如果找到了用户ID，使用下面的脚本恢复profiles记录:
-- INSERT INTO public.profiles (id, wechat_nickname, is_admin, created_at)
-- VALUES (
--   '[用户ID]',  -- 替换为实际的用户ID
--   'admin',
--   true,
--   now()
-- );

-- 方法2: 如果auth.users中也没有了，需要通过Supabase Dashboard创建
-- 1. 进入 Authentication > Users
-- 2. 点击 "Add User"
-- 3. 填写:
--    - Email: admin@yushuo.local  
--    - Password: 7287843
--    - Email Confirmed: true
-- 4. 创建成功后获取用户ID，然后执行下面的SQL:

-- 使用实际用户ID替换下面的[USER_ID]
-- INSERT INTO public.profiles (id, wechat_nickname, is_admin, created_at)
-- VALUES (
--   '[USER_ID]',  -- 从Supabase Dashboard复制的实际用户ID
--   'admin',
--   true,
--   now()
-- );

-- 方法3: 临时解决方案 - 将现有用户提升为管理员
-- 如果你有其他用户账号，可以临时将其设为管理员:
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE wechat_nickname = '你的用户昵称';

-- 验证脚本 - 检查管理员是否恢复成功
-- SELECT p.id, p.wechat_nickname, p.is_admin, u.email 
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE p.is_admin = true;