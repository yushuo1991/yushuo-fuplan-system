import { useState } from 'react';
import DurationSelect from './DurationSelect';
import { DurationKey } from '../utils/duration';

export default function GrantModal({ open, onClose, onGrant }: { open: boolean; onClose: () => void; onGrant: (k: DurationKey, custom?: string)=>Promise<void>; }) {
    const [value, setValue] = useState<DurationKey>('1m');
    const [custom, setCustom] = useState<string | undefined>(undefined);
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded p-4 space-y-4 w-full max-w-md">
                <h2 className="text-lg font-semibold">设置授权时长</h2>
                <DurationSelect value={value} onChange={(k, d)=>{setValue(k); setCustom(d);}} />
                <div className="flex justify-end gap-2">
                    <button className="px-3 py-2" onClick={onClose}>取消</button>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={async()=>{await onGrant(value, custom); onClose();}}>确定</button>
                </div>
            </div>
        </div>
    );
}


