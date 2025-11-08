-- 第六步：创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
  INSERT INTO public.profiles (id, wechat_nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'wechat_nickname',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 第七步：创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 第八步：启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

-- 第九步：创建profiles表的策略
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete_admin ON public.profiles;
CREATE POLICY profiles_delete_admin ON public.profiles FOR DELETE USING (public.is_admin());

-- 第十步：创建access_grants表的策略
DROP POLICY IF EXISTS grants_select_own ON public.access_grants;
CREATE POLICY grants_select_own ON public.access_grants FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS grants_select_admin ON public.access_grants;
CREATE POLICY grants_select_admin ON public.access_grants FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS grants_modify_admin ON public.access_grants;
CREATE POLICY grants_modify_admin ON public.access_grants FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS grants_update_admin ON public.access_grants;
CREATE POLICY grants_update_admin ON public.access_grants FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS grants_delete_admin ON public.access_grants;
CREATE POLICY grants_delete_admin ON public.access_grants FOR DELETE USING (public.is_admin());