import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function ProtectedRoute({ children, adminOnly = false }: { children: JSX.Element; adminOnly?: boolean; }) {
    const { user, profile, loading } = useAuth();
    if (loading) return <div className="h-screen flex items-center justify-center">加载中...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && !profile?.is_admin) return <Navigate to="/login" replace />;
    return children;
}


