'use client';

import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, Clock, ShieldCheck, AlertOctagon } from "lucide-react";

interface ComplianceData {
    kpi: {
        averageResolutionTime: number;
        resolutionTrend: string;
        nationalCompletionRate: number;
        totalActiveOverdue: number;
    };
    turtlePenaltiesByRegion: any[];
    quarterlyResolutionTrend: any[];
}

interface ComplianceRadarProps {
    data: ComplianceData | null;
    isLoading: boolean;
}

export function ComplianceRadarCharts({ data, isLoading }: ComplianceRadarProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-64 bg-slate-100 rounded-2xl border border-slate-200 ${i === 1 ? 'lg:col-span-1' : 'lg:col-span-2'}`}></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* KPI Cards Strip (Left Side Stacked) */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="glass-card bg-slate-900 border-slate-800 text-white shadow-xl">
                    <CardContent className="p-6 flex flex-col justify-center h-full">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2.5 bg-slate-800 rounded-lg">
                                <Clock className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                {data.kpi.resolutionTrend} Days
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-1 pt-4">National Resolution SLA Time</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black tracking-tighter">{data.kpi.averageResolutionTime}</h3>
                            <span className="text-slate-500 font-medium">Days</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="glass-card shadow-sm border-slate-200">
                        <CardContent className="p-4 flex flex-col items-center text-center justify-center">
                            <Target className="w-6 h-6 text-emerald-500 mb-2" />
                            <h4 className="text-2xl font-bold text-slate-900">{data.kpi.nationalCompletionRate}%</h4>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Completion<br />Rate</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card shadow-sm border-slate-200 bg-rose-50/30">
                        <CardContent className="p-4 flex flex-col items-center text-center justify-center">
                            <AlertOctagon className="w-6 h-6 text-rose-500 mb-2" />
                            <h4 className="text-2xl font-bold text-rose-700">{data.kpi.totalActiveOverdue}</h4>
                            <p className="text-[10px] uppercase font-bold text-rose-500/80 tracking-wider">Active<br />Overdue</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Middle: Submission Discipline Index (Donut Pie) */}
            <Card className="lg:col-span-1 glass-card shadow-sm border-slate-200 flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-800">Submission Discipline Index</h3>
                </div>
                <div className="p-4 flex-1 relative flex flex-col items-center justify-center min-h-[250px]">
                    <p className="text-xs text-slate-500 text-center mb-[-20px] z-10 px-4">Distribution of "Turtle Badges" (Late Submissions) across Regions.</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={data.turtlePenaltiesByRegion}
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="infractions"
                            >
                                {data.turtlePenaltiesByRegion.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                formatter={(value: number, name: string) => [`${value} Penalties`, name]}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Right: Quarterly Trend (Line Chart) */}
            <Card className="lg:col-span-1 glass-card shadow-sm border-slate-200 flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">YTD Performance Trend</h3>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-end min-h-[250px]">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.quarterlyResolutionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[70, 100]} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            <Line type="monotone" dataKey="actual" name="Actual Performance (%)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="target" name="Corporate Target (%)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

        </div>
    );
}
