'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    ShieldCheck,
    LayoutDashboard,
    Target,
    LineChart,
    Users,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

// Dynamic RBAC Menu implementation based on actual Next.js page paths
const getMenuByRole = (role: string = '') => {
    // If empty role (loading state), just show dashboard
    if (!role) {
        return [{ name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: [] }];
    }

    const allMenus = [
        { name: 'National Data Analysis', icon: Users, href: '/dashboard', roles: ['HCBP', 'Superadmin'] },
        { name: 'Regional Data Analysis', icon: LineChart, href: '/dashboard/region', roles: ['Regional Director', 'HCBP', 'Superadmin'] },
        { name: 'Branch Data Analysis', icon: ShieldCheck, href: '/dashboard/branch', roles: ['Branch Head', 'Regional Director', 'HCBP', 'Superadmin'] },
        { name: 'Store Action Plan', icon: Target, href: '/dashboard/store', roles: ['Store Head', 'Branch Head', 'Regional Director', 'HCBP', 'Superadmin'] },
    ];

    return allMenus.filter(menu => menu.roles.includes(role));
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    // State to hold dynamic role
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (data && data.role) {
                    setUserRole(data.role);
                }
            }
        }
        fetchRole();
    }, [supabase]);

    const menus = getMenuByRole(userRole);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="w-64 h-screen hidden md:flex flex-col border-r border-slate-200/50 glass">
            <div className="h-16 flex items-center px-6 border-b border-slate-200/50">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <span>Morrigan V2</span>
                </div>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                {!userRole ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    menus.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn(
                                        "w-full justify-start gap-3 h-11 transition-all duration-300",
                                        isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-slate-500 hover:text-primary hover:bg-slate-100/50"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className={cn(isActive && "font-semibold")}>{item.name}</span>
                                </Button>
                            </Link>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-slate-200/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 text-slate-500 hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
