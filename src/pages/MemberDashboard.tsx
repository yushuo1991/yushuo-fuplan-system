import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface AccessGrant {
    expires_at: string | null;
    granted_at: string;
    duration_key: string;
}

export default function MemberDashboard() {
    const { user, profile } = useAuth();
    const [grant, setGrant] = useState<AccessGrant | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadGrant = async () => {
            if (!user) return;
            
            const { data } = await supabase
                .from('access_grants')
                .select('expires_at, granted_at, duration_key')
                .eq('user_id', user.id)
                .maybeSingle();
                
            setGrant(data);
            setLoading(false);
        };
        
        loadGrant();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDurationLabel = (key: string) => {
        const labels: Record<string, string> = {
            'forever': '永久',
            '1y': '1年',
            '6m': '6个月', 
            '3m': '3个月',
            '1m': '1个月',
            'custom': '自定义'
        };
        return labels[key] || key;
    };

    const getRemainingDays = () => {
        if (!grant?.expires_at) return null;
        const now = new Date();
        const expiry = new Date(grant.expires_at);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">加载中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 头部导航 */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-semibold text-gray-900">宇硕复盘图鉴</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                欢迎，{profile?.wechat_nickname || '用户'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* 欢迎卡片 */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                欢迎使用宇硕复盘系统
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                专业的交易复盘分析平台，基于市场情绪周期理论，帮助您建立完整的交易体系。
                            </p>
                            
                            {/* 会员状态 */}
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-user-check text-blue-400"></i>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            会员状态
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            {grant ? (
                                                <div className="space-y-1">
                                                    <p><strong>授权类型:</strong> {getDurationLabel(grant.duration_key)}</p>
                                                    <p><strong>授权时间:</strong> {formatDate(grant.granted_at)}</p>
                                                    {grant.expires_at ? (
                                                        <>
                                                            <p><strong>到期时间:</strong> {formatDate(grant.expires_at)}</p>
                                                            <p>
                                                                <strong>剩余天数:</strong> 
                                                                <span className={`ml-2 ${getRemainingDays()! > 7 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {getRemainingDays()} 天
                                                                </span>
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-green-600 font-medium">永久访问权限</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-red-600">未获得访问授权</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 功能模块网格 */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {/* 复盘系统 */}
                        <div 
                            onClick={() => navigate('/index')}
                            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-chart-line text-indigo-400 text-2xl"></i>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                复盘系统
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                市场情绪周期分析
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-500">
                                        基于混沌期、主升期、盘顶期、退潮期的市场情绪分析工具
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                        <i className="fas fa-arrow-right mr-2"></i>
                                        进入系统
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 宇硕板块节奏 */}
                        <div
                            onClick={() => window.open('https://bk.yushuo.click', '_blank')}
                            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-wave-square text-green-400 text-2xl"></i>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                宇硕板块节奏
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                实时板块分析
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-500">
                                        实时监控板块轮动、强弱分化，把握市场主线机会
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                        <i className="fas fa-external-link-alt mr-2"></i>
                                        访问板块分析
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 风险管控 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg opacity-75">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-shield-alt text-red-400 text-2xl"></i>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                风险管控
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                多维度风险评估
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-500">
                                        实时仓位监控，建立完善的风险管理体系
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button 
                                        className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
                                        disabled
                                    >
                                        即将开放
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 使用指南 */}
                    <div className="mt-8 bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                <i className="fas fa-book-open mr-2 text-indigo-600"></i>
                                使用指南
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">复盘系统功能</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>情绪周期判断：混沌期、主升期、盘顶期、退潮期四个阶段识别</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>板块分析：实时跟踪板块轮动和市场热点</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>市场记录：记录每日市场观察和交易想法</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>数据可视化：通过图表直观展示市场情绪变化</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">宇硕板块节奏</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>板块轮动监控：实时追踪资金流向和板块切换</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>强弱分化分析：识别领涨板块和滞涨板块</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>主线机会把握：快速定位市场主流热点</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                            <span>数据可视化展示：直观的板块走势和关联性分析</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="rounded-md bg-blue-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-lightbulb text-blue-400 text-xl"></i>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                <strong>提示：</strong>建议每天交易结束后使用复盘系统记录市场观察和交易想法，
                                                长期坚持可以帮助您建立完整的交易体系和市场认知。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}