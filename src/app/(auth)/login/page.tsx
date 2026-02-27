'use client';

import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login } from './actions';
import { toast } from 'sonner';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function clientAction(formData: FormData) {
        setIsLoading(true);
        const result = await login(formData);

        if (result?.error) {
            toast.error(result.error);
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background aesthetics */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>

            <div className="z-10 w-full max-w-md">
                <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                        <ShieldCheck className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <Card className="glass-card animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Morrigan V2</CardTitle>
                        <CardDescription className="text-slate-500">
                            Enter your credentials to access the Mission Board
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={clientAction} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="userId"
                                    name="userId"
                                    type="text"
                                    placeholder="Enter User ID (e.g. 2019 or msi)"
                                    autoCapitalize="none"
                                    autoComplete="username"
                                    autoCorrect="off"
                                    required
                                    className="bg-white/50 border-slate-200/50 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    required
                                    className="bg-white/50 border-slate-200/50 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {isLoading ? "Authenticating..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
