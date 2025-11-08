-- Fixed Schema for Supabase - 修复版数据库结构
-- 分步执行，避免语法错误

-- 第一步：启用扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 第二步：创建profiles表
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wechat_nickname text NOT NULL UNIQUE,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 第三步：创建access_grants表
CREATE TABLE IF NOT EXISTS public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES public.profiles(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  duration_key text NOT NULL CHECK (duration_key IN ('forever','1y','6m','3m','1m','custom'))
);

-- 第四步：创建索引
CREATE INDEX IF NOT EXISTS idx_access_grants_granted_by ON public.access_grants(granted_by);

-- 第五步：创建管理员检查函数
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;