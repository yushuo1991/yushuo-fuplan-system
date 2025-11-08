export default function DeleteConfirm({ open, onClose, onConfirm, nickname }: { open: boolean; onClose: () => void; onConfirm: () => Promise<void>; nickname: string; }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded p-4 space-y-4 w-full max-w-md">
                <h2 className="text-lg font-semibold">确认删除</h2>
                <p>将删除用户：{nickname}。此操作不可恢复。</p>
                <div className="flex justify-end gap-2">
                    <button className="px-3 py-2" onClick={onClose}>取消</button>
                    <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={async()=>{ await onConfirm(); onClose(); }}>删除</button>
                </div>
            </div>
        </div>
    );
}


