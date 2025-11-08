import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const adminUser = import.meta.env.VITE_ADMIN_USERNAME as string;
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD as string;
    const adminEmail = 'admin@yushuo.local';

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (username !== adminUser || password !== adminPass) {
            setError('管理员账号或密码不正确');
            return;
        }
        setLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: adminPass
            });
            if (signInError) throw signInError;
            // 跳转到gate，让UserGate来判断是否是管理员
            navigate('/gate');
        } catch (err: any) {
            setError(err.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        管理员登录
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        请输入管理员凭据
                    </p>
                </div>

                {/* Admin Login Form */}
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                管理员账号
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder="请输入管理员账号"
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
                                管理员密码
                            </label>
                            <input
                                id="admin-password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder="请输入管理员密码"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    登录中...
                                </>
                            ) : (
                                '管理员登录'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                            返回用户登录
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}


