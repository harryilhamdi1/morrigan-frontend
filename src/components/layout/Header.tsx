'use client';
import { Bell, Search, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function Header() {
    const [profile, setProfile] = useState<{ full_name: string; role: string; location: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('full_name, role, stores(name), branches(name), regions(name)')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    let location = '';
                    if (data.role === 'Store Head') location = (data.stores as any)?.name || '';
                    else if (data.role === 'Branch Head') location = (data.branches as any)?.name || '';
                    else if (data.role === 'Regional Director') location = (data.regions as any)?.name || '';
                    else location = 'Headquarters';

                    setProfile({
                        full_name: data.full_name,
                        role: data.role,
                        location
                    });
                }
            }
        }
        fetchProfile();
    }, [supabase]);

    return (
        <header className="h-16 border-b border-slate-200/50 glass flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        type="text"
                        placeholder="Search stores, missions, or logs..."
                        className="pl-10 bg-white/50 border-slate-200/50 focus-visible:ring-primary/50 text-slate-900 placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 bg-white/50 border border-slate-200/50 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Wave 1 2024
                </div>

                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100/50">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full"></span>
                </Button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200/50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">{profile?.full_name || 'Loading...'}</p>
                        <p className="text-xs text-slate-500 max-w-[150px] truncate" title={profile ? `${profile.role} - ${profile.location}` : ''}>
                            {profile?.role || '...'} {profile?.location ? `(${profile.location})` : ''}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                        <UserCircle className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
