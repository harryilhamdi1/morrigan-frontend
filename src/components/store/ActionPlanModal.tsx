'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudUpload, UserCircle2, AlertTriangle, Info } from "lucide-react"

interface ActionPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    planData: any | null;
    activeWeek: number;
}

export function ActionPlanModal({ isOpen, onClose, planData, activeWeek }: ActionPlanModalProps) {
    if (!planData) return null;

    const isWeekTwoOnwards = activeWeek > 1;
    const isLocked = planData.status === 'Resolved' || planData.status === 'Waiting for Approval';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] bg-slate-50 border-slate-200/50 p-0 overflow-hidden">
                <div className="bg-white border-b border-slate-200/50 p-6 flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-full text-amber-600">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl text-slate-900 border-none pb-1">{planData.journey}</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-medium">
                                {planData.historicalTag || 'Action Plan Target'}
                            </span>
                            <span className="mx-2">•</span>
                            Due Date: <strong className="text-slate-700">{planData.dueDate}</strong>
                            <span className="mx-2">•</span>
                            Status: <strong className="text-slate-700">{planData.status}</strong>
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8">
                    {/* Diagnosis Section */}
                    <div className="space-y-3">
                        <Label className="text-slate-900 font-bold border-b border-slate-200/50 pb-2 flex">Root Cause Diagnosis</Label>
                        {planData.type === 'quantitative' && planData.failedItems?.length > 0 && (
                            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                                {planData.failedItems.map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        )}
                        {planData.type === 'qualitative' && planData.qualitativeContext && (
                            <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-purple-700 text-sm italic">
                                "{planData.qualitativeContext}"
                            </div>
                        )}
                    </div>

                    {/* Week 1 Planning */}
                    <div className="space-y-4">
                        <Label className="text-slate-900 font-bold border-b border-slate-200/50 pb-2 flex">Execution Plan (Week 1)</Label>

                        <div className="grid gap-2">
                            <Label className="text-slate-600 text-xs">Root Cause Analysis (RCA)</Label>
                            <Textarea
                                defaultValue={planData.rca}
                                disabled={isWeekTwoOnwards || isLocked}
                                className="bg-white resize-none text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary"
                                placeholder="Jelaskan akar permasalahan (Manpower, Method, Material, Machine, Environment)..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-slate-600 text-xs">Commitment / Solusi</Label>
                            <Textarea
                                defaultValue={planData.commitment}
                                disabled={isWeekTwoOnwards || isLocked}
                                className="bg-white resize-none h-16 text-slate-900"
                                placeholder="Apa tindakan konkrit yang akan dilakukan..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-slate-600 text-xs text-slate-600 text-xs">Person In Charge (PIC)</Label>
                                <div className="relative">
                                    <UserCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        defaultValue={planData.pic}
                                        disabled={isWeekTwoOnwards || isLocked}
                                        className="bg-white pl-9 text-slate-900"
                                        placeholder="Nama karyawan bertugas..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Week 2 onwards: Implementation & Evidence */}
                    {isWeekTwoOnwards && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <Label className="text-slate-900 font-bold border-b border-slate-200/50 pb-2 flex items-center justify-between">
                                Implementation Updates (Week {activeWeek})
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 font-medium text-[10px] rounded-md uppercase tracking-wider">
                                    Active Week
                                </span>
                            </Label>

                            <div className="grid gap-2">
                                <Label className="text-slate-600 text-xs">Blockers / Kendala Edukasi</Label>
                                <select
                                    disabled={isLocked}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                                >
                                    <option value="">-- Pilih Kendala Jika Ada --</option>
                                    <option value="budget">Kurang Budget</option>
                                    <option value="vendor">Menunggu Respon Vendor Luar</option>
                                    <option value="approval">Menunggu Approval HO</option>
                                    <option value="none">Tidak Ada Kendala (Lancar)</option>
                                </select>
                            </div>

                            <div className="grid gap-2 pt-2">
                                <Label className="text-slate-600 text-xs">Bukti Perbaikan (Google Drive Link)</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" disabled={isLocked} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                        <CloudUpload className="w-4 h-4 mr-2" />
                                        Upload to Drive
                                    </Button>
                                    <Input
                                        defaultValue={planData.evidenceUrl || ""}
                                        disabled={isLocked}
                                        className="bg-white font-mono text-xs text-slate-600"
                                        placeholder="Tautan Foto/Video G-Drive otomatis terisi..."
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Branch Feedback Thread */}
                    {planData.status === 'Revision Required' && planData.branchFeedback && (
                        <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-destructive" />
                                <span className="font-semibold text-destructive text-sm">Feedback from Branch Head:</span>
                            </div>
                            <p className="text-slate-700 text-sm italic">"{planData.branchFeedback}"</p>
                        </div>
                    )}

                </div>

                <div className="bg-slate-100/50 border-t border-slate-200/50 p-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-slate-600 hover:text-slate-900">
                        Cancel
                    </Button>
                    {!isLocked && (
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            Save & Submit Progress
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
