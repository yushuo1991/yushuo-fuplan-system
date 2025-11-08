import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { nicknameToPseudoEmail } from '../utils/nicknameToEmail';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
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
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { wechat_nickname: nickname } }
            });
            if (signUpError) throw signUpError;
            navigate('/not-authorized');
        } catch (err: any) {
            setError(err.message || '注册失败');
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
                        注册新账户
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        请填写您的信息以创建账户
                    </p>
                </div>

                {/* Registration Form */}
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                                微信昵称
                            </label>
                            <input
                                id="nickname"
                                name="nickname"
                                type="text"
                                autoComplete="username"
                                required
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="请输入您的微信昵称"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                此昵称将用于登录，请准确填写
                            </p>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                设置密码
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="请设置登录密码"
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
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    注册中...
                                </>
                            ) : (
                                '创建账户'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            已有账户？
                            <Link to="/login" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                                立即登录
                            </Link>
                        </span>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                        <div className="text-sm text-yellow-700">
                            <p className="font-medium">注册须知：</p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                <li>账户注册后需要管理员审批</li>
                                <li>请确保昵称填写正确，将用于后续登录</li>
                                <li>审批通过后您将收到通知</li>
                            </ul>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}


