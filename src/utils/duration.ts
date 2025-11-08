export type DurationKey = 'forever' | '1y' | '6m' | '3m' | '1m' | 'custom';

export function calcExpiry(key: DurationKey, customDate?: string): string | null {
    if (key === 'forever') return null;
    const now = new Date();
    const d = new Date(now);
    switch (key) {
        case '1y': d.setFullYear(d.getFullYear() + 1); break;
        case '6m': d.setMonth(d.getMonth() + 6); break;
        case '3m': d.setMonth(d.getMonth() + 3); break;
        case '1m': d.setMonth(d.getMonth() + 1); break;
        case 'custom':
            if (!customDate) throw new Error('customDate is required for custom duration');
            return new Date(customDate).toISOString();
    }
    return d.toISOString();
}


