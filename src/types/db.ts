export type Profile = {
    id: string;
    wechat_nickname: string;
    is_admin: boolean;
    created_at: string;
};

export type AccessGrant = {
    id: string;
    user_id: string;
    granted_by: string | null;
    granted_at: string;
    expires_at: string | null;
    duration_key: string;
};


