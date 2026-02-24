'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
    Shield,
    LayoutDashboard,
    PlusCircle,
    Settings,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/bills/new', label: 'Add Bill', icon: PlusCircle },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-bg-main">
            {/* Top navigation bar */}
            <nav className="fixed top-0 w-full z-50 bg-bg-main/80 backdrop-blur-xl border-b border-accent-dim">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="text-lg font-bold">
                            <span className="text-primary">Warranty</span>
                            <span className="text-accent">Vault</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === '/dashboard'
                                    ? pathname === '/dashboard'
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-primary/10 text-primary border-b-2 border-accent'
                                            : 'text-text-muted hover:text-text-main hover:bg-bg-surface'
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: 'w-9 h-9 ring-2 ring-accent-dim',
                                },
                            }}
                        />
                    </div>
                </div>
            </nav>

            {/* Mobile bottom nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface/95 backdrop-blur-xl border-t border-accent-dim">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all',
                                    isActive ? 'text-primary' : 'text-text-muted'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="w-1 h-1 rounded-full bg-accent" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Link href="/dashboard" className="hover:text-text-main transition-colors">
                            Dashboard
                        </Link>
                        {pathname !== '/dashboard' && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5" />
                                <span className="text-text-main capitalize">
                                    {pathname.split('/').pop()?.replace(/-/g, ' ') || ''}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
                {children}
            </main>
        </div>
    );
}
