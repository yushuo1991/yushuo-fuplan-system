-- ===============================================
-- 宇硕复盘图鉴 - 数据库数据完整备份
-- 备份时间: 2025-09-05
-- 说明: 包含所有用户数据和权限授予记录
-- ===============================================

-- 清理现有数据（恢复时使用，谨慎操作）
-- DELETE FROM public.access_grants;
-- DELETE FROM public.profiles;

-- ===============================================
-- 1. 恢复用户档案数据 (profiles)
-- ===============================================
INSERT INTO public.profiles (id, wechat_nickname, is_admin, created_at) VALUES ('efdde1b2-25fb-44e7-89aa-1c202fdfa571', 'test3', false, '2025-09-05 07:57:47.129237+00'), ('4785af7d-c255-4a28-ba5c-dafc17660c7a', 'test4', false, '2025-09-05 08:50:25.107756+00'), ('1f7b9091-e602-4264-9677-24b5b0b25d8b', '宇硕', false, '2025-09-05 09:33:15.089672+00'), ('38e9d121-a65d-47fc-b439-15c21f5cc6a5', 'admin', true, '2025-09-05 09:49:21.29874+00');

-- ===============================================
-- 2. 恢复访问权限数据 (access_grants)
-- ===============================================
INSERT INTO public.access_grants (id, user_id, granted_by, granted_at, expires_at, duration_key) VALUES ('8234ab79-799a-438a-b2ef-3206ee7ad934', 'efdde1b2-25fb-44e7-89aa-1c202fdfa571', NULL, '2025-09-05 08:02:32.904739+00', '2025-10-05 08:02:37.652+00', '1m'), ('81f72c94-bdfc-40b6-bdf7-ed7349883cb7', '1f7b9091-e602-4264-9677-24b5b0b25d8b', NULL, '2025-09-05 09:34:25.396445+00', '2025-10-05 09:34:27.94+00', '1m');

-- ===============================================
-- 数据备份说明
-- ===============================================

-- 用户档案 (4个用户):
-- 1. test3 (普通用户) - 有1个月权限，10月5日到期
-- 2. test4 (普通用户) - 无访问权限
-- 3. 宇硕 (普通用户) - 有1个月权限，10月5日到期  
-- 4. admin (管理员) - 管理员权限，无需access_grants

-- 访问权限 (2条记录):
-- - test3 和 宇硕 各有1个月访问权限
-- - 授权时间: 2025-09-05
-- - 到期时间: 2025-10-05
-- - granted_by为NULL表示初始授权

-- ===============================================
-- 恢复后验证
-- ===============================================

-- 验证用户数据
-- SELECT wechat_nickname, is_admin, created_at FROM public.profiles ORDER BY created_at;

-- 验证权限数据  
-- SELECT p.wechat_nickname, ag.duration_key, ag.expires_at
-- FROM public.profiles p
-- LEFT JOIN public.access_grants ag ON p.id = ag.user_id
-- ORDER BY p.created_at;