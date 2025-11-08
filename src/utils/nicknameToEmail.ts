import crypto from 'crypto-js';

export function nicknameToPseudoEmail(nickname: string): string {
    const trimmed = nickname.trim();
    const digest = crypto.SHA1(trimmed).toString(crypto.enc.Hex);
    const domain = (import.meta.env.VITE_FAKE_EMAIL_DOMAIN as string) || 'wx.local';
    return `u_${digest.slice(0, 24)}@${domain}`; // 稳定伪邮箱
}


