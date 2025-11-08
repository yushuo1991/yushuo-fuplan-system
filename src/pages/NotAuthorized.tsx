import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function NotAuthorized() {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="text-center space-y-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">等待管理员审批</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            您的账户已注册成功，但需要管理员审批后才能访问系统。
                        </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-md p-4">
                        <div className="text-sm text-blue-700">
                            <p className="font-medium">下一步操作：</p>
                            <ul className="mt-2 list-disc list-inside space-y-1 text-left">
                                <li>扫描下方二维码联系管理员</li>
                                <li>管理员审批后您将收到通知</li>
                                <li>审批通过后即可正常登录使用</li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* 引流图片 */}
                    <div className="mt-4">
                        <img 
                            src="/引流横图.png" 
                            alt="扫码联系管理员获取授权" 
                            className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                        />
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                        <Link 
                            to="/login" 
                            onClick={handleLogout}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            重新登录
                        </Link>
                        <Link 
                            to="/register" 
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            使用其他账户注册
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


