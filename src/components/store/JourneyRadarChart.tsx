'use client';

import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface RadarData {
    subject: string;
    A: number;
    fullMark: number;
}

interface JourneyRadarChartProps {
    data: RadarData[];
}

export function JourneyRadarChart({ data }: JourneyRadarChartProps) {
    // Custom label formatter to shorten subject names on small screens
    const formatLabel = (value: string) => {
        // E.g. "A. Facility" -> "A."
        return value.split('.')[0] + '.';
    };

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                    // tickFormatter={formatLabel} // Optional if space becomes tight
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickCount={6}
                    />
                    <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
