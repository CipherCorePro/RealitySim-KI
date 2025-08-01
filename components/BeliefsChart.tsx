import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTranslations } from '../hooks/useTranslations';
import type { TranslationKey } from '../translations';

interface BeliefsChartProps {
    data: { name: string; value: number }[];
    barColor?: string;
    keyPrefix?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-700/80 backdrop-blur-sm p-2 border border-slate-600 rounded-md text-sm">
                <p className="label text-slate-200">{`${label}`}</p>
                <p className="intro text-sky-400">{`Value: ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};


export const BeliefsChart: React.FC<BeliefsChartProps> = ({ data, barColor = '#8884d8', keyPrefix }) => {
    const t = useTranslations();
    
    const translatedData = React.useMemo(() => {
        if (!keyPrefix) {
            return data;
        }
        return data.map(item => {
             const key = `${keyPrefix}${item.name}` as TranslationKey;
             const translatedName = t(key);
             return {
                ...item,
                name: translatedName === key ? item.name : translatedName,
            };
        });
    }, [data, keyPrefix, t]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={translatedData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[0, 1]} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={120} tick={{ fill: '#cbd5e1' }}/>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                <Bar dataKey="value" fill={barColor} barSize={15} />
            </BarChart>
        </ResponsiveContainer>
    );
};