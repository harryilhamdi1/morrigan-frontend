'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceLine
} from 'recharts';

interface ChartData {
    name: string;
    storeScore: number;
    avgNational: number;
    avgBranch: number;
}

interface WaveSplineChartProps {
    data: ChartData[];
}

export function WaveSplineChart({ data }: WaveSplineChartProps) {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 0,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />

                    {/* Dotted Lines for Averages */}
                    <ReferenceLine y={82} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg National (82)', fill: '#f59e0b', fontSize: 11 }} />

                    <Area
                        type="monotone"
                        dataKey="avgBranch"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="transparent"
                        name="Avg Branch"
                    />

                    {/* Main Store Line */}
                    <Area
                        type="monotone"
                        dataKey="storeScore"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        name="Store Score"
                        dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#3b82f6' }}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
