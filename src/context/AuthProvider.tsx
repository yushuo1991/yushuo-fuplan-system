import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type Profile = {
    id: string;
    wechat_nickname: string | null;
    is_admin: boolean;
    created_at: string;
};

type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        };
        init();
        const { data: sub } = supabase.auth.onAuthStateChange((_event: any, s: any) => {
            setSession(s);
            setUser(s?.user ?? null);
        });
        return () => { sub.subscription.unsubscribe(); };
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!user) { setProfile(null); return; }
            const { data, error } = await supabase
                .from('profiles')
                .select('id,wechat_nickname,is_admin,created_at')
                .eq('id', user.id)
                .maybeSingle();
            if (!error) setProfile(data as Profile | null);
        };
        load();
    }, [user]);

    const value = useMemo<AuthContextType>(() => ({
        session, user, profile, loading,
        refreshProfile: async () => {
            if (!user) return;
            const { data } = await supabase
                .from('profiles')
                .select('id,wechat_nickname,is_admin,created_at')
                .eq('id', user.id)
                .maybeSingle();
            setProfile(data as Profile | null);
        }
    }), [session, user, profile, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}


