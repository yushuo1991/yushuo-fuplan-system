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
            month: 'numeric',
            day: 'numeric',
        });
    };

    const getDurationLabel = (key: string) => {
        const labels: Record<string, string> = {
            'forever': '永久会员',
            '1y': '年度会员',
            '6m': '半年会员', 
            '3m': '季度会员',
            '1m': '月度会员',
            'custom': '定制会员'
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="text-sm text-gray-400 font-medium">加载数据中...</div>
                </div>
            </div>
        );
    }

    const remainingDays = getRemainingDays();
    const isExpired = remainingDays !== null && remainingDays <= 0;

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-indigo-100">
            {/* 顶部导航：毛玻璃效果 */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">YS</span>
                            </div>
                            <h1 className="text-lg font-semibold tracking-tight text-gray-900">宇硕复盘图鉴</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900">
                                    {profile?.wechat_nickname || '用户'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {grant ? getDurationLabel(grant.duration_key) : '游客'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
                            >
                                退出
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* 状态概览区域 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 左侧：欢迎词 */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                                早安，开启复盘时刻。
                            </h2>
                            <p className="text-gray-500 text-lg max-w-md leading-relaxed">
                                基于市场情绪周期理论，助您建立严谨的交易体系。
                            </p>
                        </div>
                        {/* 装饰性背景元素 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                    </div>

                    {/* 右侧：会员卡片 (Apple Wallet 风格) */}
                    <div className="col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i className="fas fa-crown text-8xl transform rotate-12"></i>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">会员权益</p>
                                    <h3 className="text-xl font-bold mt-1">
                                        {grant ? getDurationLabel(grant.duration_key) : '未授权'}
                                    </h3>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${grant ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {grant ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                            </div>

                            <div className="mt-8 space-y-1">
                                {grant ? (
                                    <>
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-400 text-sm">剩余有效期</span>
                                            {grant.expires_at ? (
                                                <span className={`text-2xl font-mono font-bold ${remainingDays! < 7 ? 'text-red-400' : 'text-white'}`}>
                                                    {remainingDays} <span className="text-sm font-sans font-normal text-gray-400">天</span>
                                                </span>
                                            ) : (
                                                <span className="text-xl font-medium text-emerald-400">∞</span>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                                style={{ width: grant.expires_at ? '80%' : '100%' }} // 这里可以根据总时长计算百分比，目前写死示意
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-right">
                                            {grant.expires_at ? `有效期至 ${formatDate(grant.expires_at)}` : '永久访问权'}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400">请联系管理员开通权限以解锁全部功能。</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 应用入口 Grid (Bento Box) */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">核心功能</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* 1. 复盘系统 */}
                        <div 
                            onClick={() => navigate('/index')}
                            className="group bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-100 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors duration-300">
                                <i className="fas fa-chart-line text-indigo-600 text-xl group-hover:text-white transition-colors"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">复盘系统</h3>
                            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                                混沌、主升、盘顶、退潮。全周期市场情绪量化分析。
                            </p>
                            <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                                进入系统 <i className="fas fa-arrow-right ml-2 text-xs"></i>
                            </div>
                        </div>

                        {/* 2. 宇硕板块节奏 */}
                        <div
                            onClick={() => window.open('https://bk.yushuo.click', '_blank')}
                            className="group bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-100 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors duration-300">
                                <i className="fas fa-wave-square text-emerald-600 text-xl group-hover:text-white transition-colors"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">板块节奏</h3>
                            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                                实时监控板块轮动与强弱分化，精准把握市场主线。
                            </p>
                            <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                                查看分析 <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                            </div>
                        </div>

                        {/* 3. 心理评估系统 */}
                        <div
                            onClick={() => window.open('https://xinli.yushuo.click', '_blank')}
                            className="group bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-100 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors duration-300">
                                <i className="fas fa-brain text-purple-600 text-xl group-hover:text-white transition-colors"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">心理评估</h3>
                            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                                专业的交易心理状态评估，知己知彼，理性交易。
                            </p>
                            <div className="flex items-center text-sm font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                                开始评估 <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 使用指南 (类似 iOS Tips) */}
                <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <i className="fas fa-book-open text-gray-400"></i>
                        <h3 className="text-lg font-semibold text-gray-900">使用指南</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">复盘系统核心</h4>
                            <ul className="space-y-3">
                                {[
                                    '情绪周期判断：精准识别混沌、主升、盘顶、退潮',
                                    '板块分析：全天候跟踪板块轮动',
                                    '市场记录：数字化沉淀每日交易想法',
                                    '可视化图表：直观呈现市场情绪温差'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3 flex-shrink-0"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">板块节奏分析</h4>
                            <ul className="space-y-3">
                                {[
                                    '资金流向：捕捉主力资金的每一次切换',
                                    '强弱分化：一眼识别领涨龙头与跟风杂毛',
                                    '主线机会：快速定位当天唯一市场合力点',
                                    '关联分析：板块间的联动逻辑可视化'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex gap-4 bg-blue-50/50 p-4 rounded-xl items-start">
                            <i className="fas fa-lightbulb text-blue-500 mt-1"></i>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                <strong>Pro Tip：</strong> 建议每天收盘后花 15 分钟使用复盘系统记录。
                                复盘不是为了预判明天，而是为了在明天市场走出某种形态时，你能第一时间匹配上你的交易计划。
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}