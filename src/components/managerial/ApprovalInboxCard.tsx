'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BadgeAlert, MapPin, XCircle, CheckCircle2, CloudLightning, FileImage, MessageSquare } from 'lucide-react';

interface ApprovalQueueItem {
    id: string;
    storeName: string;
    storeCode: string;
    journey: string;
    failedItems: string[];
    originalSentiment: string | null;
    rca: string;
    pic: string;
    commitment: string;
    evidenceUrl: string | null;
    submittedAt: string;
}

interface ApprovalInboxCardProps {
    item: ApprovalQueueItem;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
}

export function ApprovalInboxCard({ item, onApprove, onReject }: ApprovalInboxCardProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const quickReplies = [
        "Foto bukti yang diunggah kurang jelas/blur.",
        "Akar masalah (RCA) tidak sesuai dengan temuan MS.",
        "Batas waktu penyelesaian yang diajukan terlalu lama.",
        "Komitmen solusi bersifat sementara, bukan permanen."
    ];

    const formatTime = (isoString: string) => {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        }).format(new Date(isoString));
    };

    return (
        <Card className="glass-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative border-slate-200">
            {/* Split View Container */}
            <div className="flex flex-col md:flex-row h-full">

                {/* Panel Kiri: Dosa Asli (The Problem) */}
                <div className="md:w-[45%] bg-slate-50/80 p-6 border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{item.storeName}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.storeCode}
                                <span className="mx-1">•</span>
                                <span className="text-slate-400">Submitted: {formatTime(item.submittedAt)}</span>
                            </div>
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200">
                            Waiting Approval
                        </div>
                    </div>

                    <div className="mt-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block border-b border-slate-200 pb-1">Reported Issue</span>
                        <h4 className="font-semibold text-slate-800 text-sm mb-3 text-red-600">{item.journey}</h4>

                        {item.originalSentiment ? (
                            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl relative">
                                <BadgeAlert className="absolute top-3 right-3 w-5 h-5 text-purple-300" />
                                <p className="text-sm text-purple-800 italic pr-6 pb-1">"{item.originalSentiment}"</p>
                                <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">AI Voice of Customer</span>
                            </div>
                        ) : (
                            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm bg-white/50 p-3 rounded-xl border border-slate-200/50">
                                {item.failedItems.map((fi, i) => (
                                    <li key={i}>{fi}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Panel Kanan: Solusi Toko & Aksi (The Solution & Action) */}
                <div className="md:w-[55%] p-6 flex flex-col justify-between bg-white">

                    {!isRejecting ? (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block border-b border-slate-200 pb-1">Store Execution Plan</span>

                            <div>
                                <h5 className="text-xs font-semibold text-slate-500">Root Cause Analysis (RCA)</h5>
                                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                                    {item.rca}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500">Commitment</h5>
                                    <p className="text-sm text-slate-800 mt-1 font-medium">{item.commitment}</p>
                                </div>
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500">PIC Person in Charge</h5>
                                    <div className="text-sm text-slate-800 mt-1 flex items-center gap-1.5 font-medium">
                                        <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                            {item.pic.charAt(0)}
                                        </div>
                                        {item.pic}
                                    </div>
                                </div>
                            </div>

                            {item.evidenceUrl && (
                                <div className="pt-2">
                                    <h5 className="text-xs font-semibold text-slate-500 mb-1">Attached Evidence</h5>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors max-w-full truncate">
                                        <FileImage className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{item.evidenceUrl.replace('https://drive.google.com/', 'gdrive/')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Panel Revisi (Conversational Thread Simulation)
                        <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
                            <div className="flex items-center gap-2 text-destructive mb-4 border-b border-destructive/20 pb-3">
                                <MessageSquare className="w-5 h-5" />
                                <h4 className="font-bold">Provide Revision Feedback</h4>
                            </div>

                            <p className="text-xs text-slate-500 mb-3">Pesannya akan muncul sebagai "Chat Bubble" di layar Store Head.</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {quickReplies.map((qr, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setRejectReason(qr)}
                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-left transition-colors border border-slate-200"
                                    >
                                        {qr}
                                    </button>
                                ))}
                            </div>

                            <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Ketik manual teguran Anda atau pilih Quick Reply di atas..."
                                className="resize-none h-28 bg-white focus-visible:ring-destructive border-slate-300 text-slate-800 mb-4"
                            />

                            <div className="mt-auto flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setIsRejecting(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={rejectReason.length < 10}
                                    onClick={() => onReject(item.id, rejectReason)}
                                >
                                    <CloudLightning className="w-4 h-4 mr-2" />
                                    Send Revision
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isRejecting && (
                        <div className="mt-8 pt-4 border-t border-slate-200/60 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsRejecting(true)}
                                className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => onApprove(item.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve Plan
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </Card>
    );
}
