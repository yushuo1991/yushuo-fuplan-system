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
            {/* 退出按钮 */}
            <div className="absolute top-4 right-4 z-50">
                <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    onClick={handleLogout}
                >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    退出账号
                </button>
            </div>
            
            {/* 主页内容 */}
            <iframe 
                src="/legacy/index.html" 
                className="w-full h-full border-0"
                title="宇硕复盘系统"
            />
        </div>
    );
}