import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { calcExpiry, DurationKey } from '../utils/duration';
import GrantModal from '../components/GrantModal';
import DeleteConfirm from '../components/DeleteConfirm';

type Row = {
    id: string;
    wechat_nickname: string;
    created_at: string;
    is_admin: boolean;
    expires_at: string | null;
};

export default function AdminDashboard() {
    const [rows, setRows] = useState<Row[]>([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        setError(null);
        
        // 分别查询profiles和access_grants，避免关联查询问题
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id,wechat_nickname,created_at,is_admin')
            .order('created_at', { ascending: false });
            
        if (profilesError) { 
            setError(profilesError.message); 
            setLoading(false); 
            return; 
        }

        const { data: grantsData, error: grantsError } = await supabase
            .from('access_grants')
            .select('user_id,expires_at');
            
        if (grantsError) { 
            setError(grantsError.message); 
            setLoading(false); 
            return; 
        }

        // 合并数据
        const grantsMap = new Map(
            (grantsData || []).map((g: any) => [g.user_id, g.expires_at])
        );
        
        const list: Row[] = (profilesData || []).map((p: any) => ({
            id: p.id,
            wechat_nickname: p.wechat_nickname,
            created_at: p.created_at,
            is_admin: p.is_admin,
            expires_at: grantsMap.get(p.id) ?? null,
        }));
        
        setRows(list);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => rows.filter(r => r.wechat_nickname?.includes(q)), [rows, q]);

    const grant = async (userId: string, key: DurationKey, custom?: string) => {
        const expires_at = calcExpiry(key, custom);
        const { data: exist } = await supabase
            .from('access_grants')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
        if (exist) {
            await supabase
                .from('access_grants')
                .update({ expires_at, duration_key: key })
                .eq('user_id', userId);
        } else {
            await supabase
                .from('access_grants')
                .insert({ user_id: userId, duration_key: key, expires_at });
        }
        await load();
    };

    const revoke = async (userId: string) => {
        await supabase.from('access_grants').update({ expires_at: new Date(0).toISOString(), duration_key: 'custom' }).eq('user_id', userId);
        await load();
    };

    const removeUser = async (userId: string) => {
        // 前端只能删业务表；auth 用户删除需服务端权限
        await supabase.from('access_grants').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
        await load();
    };

    const [grantOpen, setGrantOpen] = useState(false);
    const [grantTarget, setGrantTarget] = useState<Row | null>(null);
    const [delOpen, setDelOpen] = useState(false);
    const [delTarget, setDelTarget] = useState<Row | null>(null);

    const exportCsv = () => {
        const header = ['昵称','创建时间','授权到期'];
        const body = filtered.map(r => [
            r.wechat_nickname,
            new Date(r.created_at).toISOString(),
            r.expires_at ?? ''
        ]);
        const lines = [header, ...body].map(cols => cols.map(v => `"${(v??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'users.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">管理员后台</h1>
                <div className="flex gap-2">
                    <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={() => navigate('/admin/reviews')}
                    >
                        <i className="fas fa-chart-bar mr-2"></i>
                        复盘数据看板
                    </button>
                    <button 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        onClick={handleLogout}
                    >
                        退出登录
                    </button>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <input placeholder="搜索昵称" className="border p-2 rounded" value={q} onChange={e=>setQ(e.target.value)} />
                <button className="px-3 py-2 bg-gray-100 rounded" onClick={load}>刷新</button>
                <button className="px-3 py-2 bg-gray-100 rounded" onClick={exportCsv}>导出CSV</button>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="overflow-auto">
                <table className="min-w-[900px] w-full border">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="p-2">昵称</th>
                            <th className="p-2">创建时间</th>
                            <th className="p-2">授权到期</th>
                            <th className="p-2">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td className="p-2" colSpan={4}>加载中...</td></tr>
                        ) : filtered.map(r => (
                            <tr key={r.id} className="border-t">
                                <td className="p-2">{r.wechat_nickname}</td>
                                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                                <td className="p-2">{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : '永久'}</td>
                                <td className="p-2 space-x-2">
                                    <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>grant(r.id,'1m')}>1个月</button>
                                    <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>grant(r.id,'3m')}>3个月</button>
                                    <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>grant(r.id,'6m')}>半年</button>
                                    <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>grant(r.id,'1y')}>1年</button>
                                    <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={()=>grant(r.id,'forever')}>永久</button>
                                    <button className="px-2 py-1 bg-yellow-600 text-white rounded" onClick={()=>{ setGrantTarget(r); setGrantOpen(true); }}>设置授权</button>
                                    <button className="px-2 py-1 bg-gray-500 text-white rounded" onClick={()=>revoke(r.id)}>撤销</button>
                                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>{ setDelTarget(r); setDelOpen(true); }}>删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <GrantModal open={grantOpen} onClose={()=>setGrantOpen(false)} onGrant={async(k, d)=>{ if (grantTarget) await grant(grantTarget.id, k, d); }}/>
            <DeleteConfirm open={delOpen} onClose={()=>setDelOpen(false)} nickname={delTarget?.wechat_nickname||''} onConfirm={async()=>{ if (delTarget) await removeUser(delTarget.id); }} />
        </div>
    );
}


