import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import '../styles/enhanced.css';

export default function EnhancedLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState('spring');
    const navigate = useNavigate();
    const { user } = useAuth();

    // 如果已登录，重定向到应用
    useEffect(() => {
        if (user) {
            navigate('/app');
        }
    }, [user, navigate]);

    // 动态主题切换
    useEffect(() => {
        const themes = ['spring', 'summer', 'autumn', 'winter'];
        const interval = setInterval(() => {
            setCurrentTheme(prev => {
                const currentIndex = themes.indexOf(prev);
                return themes[(currentIndex + 1) % themes.length];
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (signInError) throw signInError;
            
            // 登录成功，重定向将在useEffect中处理
        } catch (err: any) {
            setError(err.message || '登录失败，请检查账号密码');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`enhanced-landing theme-${currentTheme}`}>
            <header className="enhanced-header">
                <nav className="enhanced-nav">
                    <div className="logo-section">
                        <div className="logo-icon">宇</div>
                        <div className="logo-text">宇硕复盘系统</div>
                    </div>
                    <div className="nav-actions">
                        <div className="status-indicator status-online">
                            <div className="status-pulse"></div>
                            系统正常运行
                        </div>
                        <Link to="/admin/login" className="btn-secondary">
                            管理员登录
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="enhanced-main">
                <section className="hero-section">
                    <h1 className="hero-title">
                        专业的复盘分析平台
                        <br />
                        <span style={{fontSize: '2.5rem', opacity: 0.8}}>
                            让每次交易都成为成长的阶梯
                        </span>
                    </h1>
                    <p className="hero-subtitle">
                        基于市场情绪周期理论，提供系统化的交易复盘工具，
                        帮助投资者建立完整的交易体系和风险管控机制。
                    </p>

                    {/* 登录表单 */}
                    <div style={{maxWidth: '400px', margin: '0 auto', marginTop: '3rem'}}>
                        <div className="feature-card">
                            <div className="feature-icon" style={{margin: '0 auto 1.5rem'}}>
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <h2 className="feature-title" style={{textAlign: 'center', marginBottom: '2rem'}}>
                                用户登录
                            </h2>
                            
                            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                                <div>
                                    <input 
                                        type="email"
                                        placeholder="请输入邮箱"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1px solid var(--color-gray-300)',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'var(--transition-default)',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--color-primary)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--color-gray-300)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <input 
                                        type="password"
                                        placeholder="请输入密码"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '1px solid var(--color-gray-300)',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'var(--transition-default)',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--color-primary)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--color-gray-300)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                
                                {error && (
                                    <div style={{
                                        color: 'var(--color-danger)',
                                        fontSize: '0.875rem',
                                        textAlign: 'center',
                                        padding: '0.5rem',
                                        background: 'var(--color-danger-soft)',
                                        borderRadius: '8px'
                                    }}>
                                        {error}
                                    </div>
                                )}
                                
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            登录中...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sign-in-alt"></i>
                                            立即登录
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                                <span style={{color: 'var(--color-gray-500)', fontSize: '0.875rem'}}>
                                    还没有账号？
                                </span>
                                <Link 
                                    to="/register" 
                                    style={{
                                        color: 'var(--color-primary)',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        marginLeft: '0.5rem'
                                    }}
                                >
                                    立即注册
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 特色功能展示 */}
                <section className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3 className="feature-title">智能市场分析</h3>
                        <p className="feature-description">
                            基于市场情绪周期，自动识别混沌期、主升期、盘顶期、退潮期，
                            为您的交易决策提供科学依据。
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-brain"></i>
                        </div>
                        <h3 className="feature-title">系统化复盘</h3>
                        <p className="feature-description">
                            结构化记录每笔交易的思路、执行和结果，
                            通过数据驱动的方式持续优化交易策略。
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h3 className="feature-title">风险管控</h3>
                        <p className="feature-description">
                            多维度风险评估，实时仓位监控，
                            帮助您建立完善的风险管理体系。
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}