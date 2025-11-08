import { Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import SimpleLogin from './pages/SimpleLogin';
import EnhancedLogin from './pages/EnhancedLogin';
import NotAuthorized from './pages/NotAuthorized';
import UserGate from './pages/UserGate';
import AppContainer from './pages/AppContainer';
import IndexPage from './pages/IndexPage';
import MemberDashboard from './pages/MemberDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ReviewDashboard from './pages/ReviewDashboard';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<SimpleLogin />} />
                <Route path="/login-enhanced" element={<EnhancedLogin />} />
                <Route path="/login-old" element={<Login />} />
                <Route path="/gate" element={<ProtectedRoute><UserGate /></ProtectedRoute>} />
                <Route path="/member" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
                <Route path="/app" element={<ProtectedRoute><AppContainer /></ProtectedRoute>} />
                <Route path="/index" element={<ProtectedRoute><IndexPage /></ProtectedRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><ReviewDashboard /></ProtectedRoute>} />
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    );
}


