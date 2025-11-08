import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ReviewRecordWithTrades } from '../types/review';

export default function ReviewDashboard() {
    const [reviews, setReviews] = useState<ReviewRecordWithTrades[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<ReviewRecordWithTrades | null>(null);
    const [filterUserId, setFilterUserId] = useState<string>('');
    const [filterDate, setFilterDate] = useState<string>('');
    const navigate = useNavigate();

    const loadReviews = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('review_records')
                .select(`
                    *,
                    profiles!review_records_user_id_fkey(wechat_nickname),
                    trading_records(*)
                `)
                .order('created_at', { ascending: false });

            if (filterUserId) {
                query = query.eq('user_id', filterUserId);
            }
            if (filterDate) {
                query = query.eq('review_date', filterDate);
            }

            const { data, error } = await query;

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('加载复盘数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [filterUserId, filterDate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    const exportToCSV = () => {
        if (reviews.length === 0) return;

        const headers = [
            '用户昵称', '复盘日期', '市场方向', '情绪阶段', 
            '板块1', '板块2', '板块3', '板块4', '板块5',
            '主升题材1', '主升题材2', '个人策略', '交易反思',
            '创建时间'
        ];

        const rows = reviews.map((r: any) => [
            r.profiles?.wechat_nickname || '',
            r.review_date || '',
            r.market_direction || '',
            r.emotion_stage || '',
            r.sector_option1 || '',
            r.sector_option2 || '',
            r.sector_option3 || '',
            r.sector_option4 || '',
            r.sector_option5 || '',
            r.rising_theme1 || '',
            r.rising_theme2 || '',
            r.personal_strategy || '',
            r.trading_reflection || '',
            formatDate(r.created_at)
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `复盘数据_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 头部 */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">复盘数据看板</h1>
                            <button
                                onClick={() => navigate('/admin')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                <i className="fas fa-arrow-left mr-1"></i>
                                返回用户管理
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            </header>

            {/* 主要内容 */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* 筛选和操作栏 */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="筛选日期"
                        />
                        <button
                            onClick={() => {
                                setFilterDate('');
                                setFilterUserId('');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            <i className="fas fa-redo mr-2"></i>
                            重置筛选
                        </button>
                        <button
                            onClick={loadReviews}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <i className="fas fa-sync-alt mr-2"></i>
                            刷新
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            <i className="fas fa-download mr-2"></i>
                            导出CSV
                        </button>
                        <div className="ml-auto text-sm text-gray-600">
                            共 {reviews.length} 条记录
                        </div>
                    </div>
                </div>

                {/* 数据表格 */}
                {loading ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                        <p className="mt-4 text-gray-600">加载中...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-600">暂无复盘数据</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            用户
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            复盘日期
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            市场方向
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            情绪阶段
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            板块
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            创建时间
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reviews.map((review: any) => (
                                        <tr key={review.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {review.profiles?.wechat_nickname || '未知用户'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {review.review_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    review.market_direction === '多头' ? 'bg-green-100 text-green-800' :
                                                    review.market_direction === '空头' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {review.market_direction || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                    {review.emotion_stage || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="max-w-xs truncate">
                                                    {[
                                                        review.sector_option1,
                                                        review.sector_option2,
                                                        review.sector_option3
                                                    ].filter(Boolean).join(', ') || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(review.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    查看详情
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* 详情模态框 */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">复盘详情</h2>
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-6">
                            {/* 基本信息 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">用户</label>
                                    <p className="mt-1 text-gray-900">{(selectedReview as any).profiles?.wechat_nickname}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">复盘日期</label>
                                    <p className="mt-1 text-gray-900">{selectedReview.review_date}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">市场方向</label>
                                    <p className="mt-1 text-gray-900">{selectedReview.market_direction || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">情绪阶段</label>
                                    <p className="mt-1 text-gray-900">{selectedReview.emotion_stage || '-'}</p>
                                </div>
                            </div>

                            {/* 板块信息 */}
                            <div>
                                <label className="text-sm font-medium text-gray-500">板块选择</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {[
                                        selectedReview.sector_option1,
                                        selectedReview.sector_option2,
                                        selectedReview.sector_option3,
                                        selectedReview.sector_option4,
                                        selectedReview.sector_option5
                                    ].filter(Boolean).map((sector, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {sector}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 策略和计划 */}
                            {selectedReview.personal_strategy && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">个人策略</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedReview.personal_strategy}</p>
                                </div>
                            )}
                            {selectedReview.buy_plan && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">买入计划</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedReview.buy_plan}</p>
                                </div>
                            )}
                            {selectedReview.sell_plan && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">卖出计划</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedReview.sell_plan}</p>
                                </div>
                            )}

                            {/* 交易记录 */}
                            {selectedReview.trading_records && selectedReview.trading_records.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">交易记录</label>
                                    <table className="min-w-full divide-y divide-gray-200 border">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">股票</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">买入价</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">卖出价</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">盈亏%</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedReview.trading_records.map((trade: any) => (
                                                <tr key={trade.id}>
                                                    <td className="px-4 py-2 text-sm">{trade.stock_name}</td>
                                                    <td className="px-4 py-2 text-sm">{trade.buy_price}</td>
                                                    <td className="px-4 py-2 text-sm">{trade.sell_price}</td>
                                                    <td className={`px-4 py-2 text-sm ${
                                                        trade.profit_percent > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {trade.profit_percent > 0 ? '+' : ''}{trade.profit_percent}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* 交易反思 */}
                            {selectedReview.trading_reflection && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">交易反思</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedReview.trading_reflection}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

