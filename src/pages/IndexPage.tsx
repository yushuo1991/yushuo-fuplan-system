import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function IndexPage() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="w-full h-screen relative">
            {/* 退出按钮 - 左下角小图标 */}
            <div className="absolute bottom-4 left-4 z-50">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-all shadow-md hover:shadow-lg group"
                    onClick={handleLogout}
                    title="退出账号"
                >
                    <i className="fas fa-sign-out-alt text-sm"></i>
                    {/* 鼠标悬停时显示文字提示 */}
                    <span className="absolute left-14 bottom-0 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        退出账号
                    </span>
                </button>
            </div>

            {/* 主页内容 */}
            <iframe
                src="/legacy/index.html?v=1.2.2"
                className="w-full h-full border-0"
                title="宇硕复盘系统"
            />
        </div>
    );
}