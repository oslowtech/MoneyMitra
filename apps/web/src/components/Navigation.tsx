'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  HeartPulse, 
  Wallet, 
  Target, 
  CreditCard, 
  TrendingUp, 
  SlidersHorizontal, 
  UserCheck,
  ShieldCheck,
  UserPlus,
  UserRound,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/auth/actions';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Financial Health', href: '/health', icon: HeartPulse },
  { name: 'Money', href: '/money', icon: Wallet },
  { name: 'Planning', href: '/planning', icon: Target },
  { name: 'Debt', href: '/debt', icon: CreditCard },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Simulator', href: '/simulator', icon: SlidersHorizontal },
  { name: 'Advisor Portal', href: '/advisor', icon: UserCheck },
  { name: 'Profile', href: '/profile', icon: UserRound },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-card p-2 text-foreground shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/60 md:hidden" />}
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card p-4 flex flex-col justify-between transition-transform md:static md:z-auto md:min-h-screen md:w-64 md:translate-x-0",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      <div>
        <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground md:hidden">
          <X className="h-5 w-5" />
        </button>
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-4 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
            M
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">Money<span className="text-primary">Mitra</span></span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">PS4 Intelligence</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User / Onboarding Links */}
      <div className="pt-4 border-t border-border space-y-2">
        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Money Mantra Setup</span>
        </Link>
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Supabase RLS Active</span>
          </span>
          <span className="bg-secondary px-2 py-0.5 rounded text-[10px] text-foreground font-mono">v2.0</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="w-full px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}
