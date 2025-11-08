import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { nicknameToPseudoEmail } from '../utils/nicknameToEmail';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const email = nicknameToPseudoEmail(nickname);
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInError) throw signInError;
            navigate('/gate');
        } catch (err: any) {
            setError(err.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
                <h1 className="text-2xl font-semibold">用户登录</h1>
                <input className="w-full border p-2 rounded" placeholder="微信昵称" value={nickname} onChange={e=>setNickname(e.target.value)} required />
                <input className="w-full border p-2 rounded" placeholder="密码" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>{loading ? '提交中...' : '登录'}</button>
                <p className="text-sm">没有账号？<Link to="/register" className="text-blue-600">去注册</Link></p>
                <p className="text-sm">管理员入口：<Link to="/admin/login" className="text-blue-600">管理员登录</Link></p>
            </form>
        </div>
    );
}


