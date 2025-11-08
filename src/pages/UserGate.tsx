import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type Grant = {
    user_id: string;
    expires_at: string | null;
};

export default function UserGate() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            try {
                console.log('🔍 UserGate: 开始检查用户授权...');
                
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error('❌ 获取会话失败:', sessionError);
                    throw sessionError;
                }
                
                const uid = sessionData.session?.user?.id;
                console.log('👤 用户ID:', uid);
                
                if (!uid) { 
                    console.log('⚠️ 未登录，跳转到登录页');
                    navigate('/login'); 
                    return; 
                }
                
                // 先检查是否是管理员
                console.log('🔍 检查管理员权限...');
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', uid)
                    .maybeSingle();
                
                if (profileError) {
                    console.error('❌ 查询 profile 失败:', profileError);
                    throw profileError;
                }
                
                console.log('📋 Profile 数据:', profileData);
                
                // 如果是管理员，直接跳转到管理后台
                if (profileData?.is_admin) {
                    console.log('✅ 管理员身份，跳转到管理后台');
                    setLoading(false);
                    navigate('/admin', { replace: true });
                    return;
                }
                
                // 非管理员用户检查权限
                console.log('🔍 检查访问授权...');
                const { data, error: grantError } = await supabase
                    .from('access_grants')
                    .select('user_id,expires_at')
                    .eq('user_id', uid)
                    .maybeSingle();
                
                if (grantError && grantError.code !== 'PGRST116') {
                    console.error('❌ 查询授权失败:', grantError);
                    throw grantError;
                }
                
                console.log('📋 授权数据:', data);
                
                const ok = data && (!data.expires_at || new Date(data.expires_at) > new Date());
                console.log('✅ 授权检查结果:', ok ? '有权限' : '无权限');
                
                setLoading(false);
                
                if (ok) {
                    console.log('✅ 跳转到会员中心');
                    navigate('/member', { replace: true });
                } else {
                    console.log('⚠️ 无授权，跳转到未授权页面');
                    navigate('/not-authorized', { replace: true });
                }
            } catch (err: any) {
                console.error('💥 检查授权时出错:', err);
                setError(err.message || '检查授权失败');
                setLoading(false);
            }
        };
        check();
    }, [navigate]);

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center flex-col">
                <div className="text-red-600 text-lg mb-4">授权检查失败</div>
                <div className="text-gray-600 mb-4">{error}</div>
                <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    返回登录
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-lg mb-2">正在校验授权...</div>
                <div className="text-sm text-gray-500">请稍候</div>
            </div>
        </div>
    );
}


