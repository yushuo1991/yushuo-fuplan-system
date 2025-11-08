import { DurationKey } from '../utils/duration';

export default function DurationSelect({ value, onChange }: { value: DurationKey; onChange: (k: DurationKey, custom?: string) => void; }) {
    return (
        <div className="flex flex-wrap gap-2">
            {[
                {k:'forever',label:'永久'},
                {k:'1y',label:'1年'},
                {k:'6m',label:'半年'},
                {k:'3m',label:'3个月'},
                {k:'1m',label:'1个月'},
            ].map(opt => (
                <button key={opt.k} className={`px-2 py-1 rounded border ${value===opt.k?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>onChange(opt.k as DurationKey)}>{opt.label}</button>
            ))}
            <button className={`px-2 py-1 rounded border ${value==='custom'?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>{const d=prompt('自定义日期 YYYY-MM-DD'); if(d) onChange('custom', d);}}>自定义</button>
        </div>
    );
}


