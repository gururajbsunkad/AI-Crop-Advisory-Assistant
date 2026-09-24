import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
import { BarChart3, BookOpen, ChevronRight, CircleUserRound, ClipboardList, FileText, Leaf, LogOut, Menu, Plus, Settings2, ShieldCheck, Sprout, X } from 'lucide-react';
import { useState } from 'react';

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
    <span className={`grid size-10 place-items-center rounded-xl ${inverse ? 'bg-[#e8d29a]' : 'bg-[#ead8b7]'}`}>
      <Leaf className={`size-5 ${inverse ? 'text-[#214f3d]' : 'text-primary'}`} strokeWidth={2.6} />
    </span>
    <span className={`display text-lg font-bold tracking-tight ${inverse ? 'text-[#f6f1e6]' : 'text-foreground'}`}>Fieldnote</span>
  </Link>;
}

export function Button({ children, variant = 'primary', className = '', type = 'button', disabled, onClick }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; type?: 'button' | 'submit'; disabled?: boolean; onClick?: () => void }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/.16)] hover:-translate-y-0.5',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/75',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    danger: 'border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15',
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} data-testid={`button-${variant}`}>
    {children}
  </button>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
    <div className="animate-rise-in">
      {eyebrow && <div className="mono mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-accent">{eyebrow}</div>}
      <h1 className="display text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}
    </div>
    {action && <div className="animate-rise-in delay-1">{action}</div>}
  </div>;
}

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const nav = [
    { href: '/dashboard', label: 'Overview', icon: BarChart3 },
    { href: '/advisory/new', label: 'New advisory', icon: Plus },
    { href: '/advisories', label: 'My advisories', icon: ClipboardList },
    { href: '/profile', label: 'Farm profile', icon: CircleUserRound },
  ];
  return <div className="paper-grain min-h-[100dvh] bg-background">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-10 flex items-center justify-between px-2"><Logo inverse /><button className="md:hidden" onClick={() => setOpen(false)} data-testid="button-close-menu"><X className="size-5" /></button></div>
      <div className="mb-5 px-2 text-[10px] font-semibold uppercase tracking-[.2em] text-sidebar-foreground/45">Your field desk</div>
      <nav className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`}><Icon className="size-[18px]" /><span>{label}</span>{href === '/advisory/new' && <span className="ml-auto grid size-5 place-items-center rounded-md bg-sidebar-primary text-xs text-sidebar-primary-foreground">+</span>}</Link>)}
      </nav>
      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4">
          <ShieldCheck className="mb-3 size-5 text-sidebar-primary" />
          <p className="text-sm font-semibold">Cautious by design</p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/55">Guidance is a starting point, not a substitute for local expertise.</p>
        </div>
        <div className="flex items-center gap-3 border-t border-sidebar-border pt-4">
          <div className="grid size-9 place-items-center rounded-full bg-sidebar-primary font-semibold text-sidebar-primary-foreground">{(user?.firstName || user?.username || 'F').slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user?.firstName || 'Farmer'}</p><p className="truncate text-xs text-sidebar-foreground/50">{user?.primaryEmailAddress?.emailAddress || 'Your account'}</p></div>
          <button onClick={() => signOut({ redirectUrl: '/' })} className="text-sidebar-foreground/50 hover:text-sidebar-foreground" title="Sign out" data-testid="button-sign-out"><LogOut className="size-4" /></button>
        </div>
      </div>
    </aside>
    {open && <button className="fixed inset-0 z-30 bg-[#172b24]/40 md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" data-testid="button-overlay" />}
    <div className="md:pl-[270px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl md:px-10">
        <button className="rounded-lg p-2 text-muted-foreground md:hidden" onClick={() => setOpen(true)} data-testid="button-open-menu"><Menu className="size-5" /></button>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span className="size-1.5 rounded-full bg-accent" />Field notes / {location === '/dashboard' ? 'Overview' : location.replace('/', '').split('/')[0]}</div>
        <div className="ml-auto flex items-center gap-2"><Link href="/profile" className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground" data-testid="link-settings"><Settings2 className="size-5" /></Link></div>
      </header>
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  </div>;
}

export function LoadingState({ label = 'Reading your field notes' }: { label?: string }) {
  return <div className="space-y-5" data-testid="loading-state"><div className="h-7 w-44 animate-pulse rounded-lg bg-muted" /><div className="grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-2xl bg-muted" /><div className="h-32 animate-pulse rounded-2xl bg-muted" /><div className="h-32 animate-pulse rounded-2xl bg-muted" /></div><p className="mono text-center text-[11px] uppercase tracking-[.16em] text-muted-foreground">{label}</p></div>;
}

export function ErrorState({ onRetry, message = 'We could not load this part of your field desk.' }: { onRetry: () => void; message?: string }) {
  return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center" data-testid="error-state"><div className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive"><X className="size-5" /></div><p className="font-semibold text-foreground">A small interruption</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message}</p><Button variant="danger" className="mt-5" onClick={onRetry}>Try again</Button></div>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="field-grid rounded-2xl border border-dashed border-border px-6 py-14 text-center" data-testid="empty-state"><div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><BookOpen className="size-6" /></div><h3 className="display text-2xl font-bold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>{action && <div className="mt-6">{action}</div>}</div>;
}

export function StatCard({ label, value, note, icon: Icon, tone = 'green' }: { label: string; value: string | number; note?: string; icon: typeof BarChart3; tone?: 'green' | 'orange' | 'cream' }) {
  return <div className={`rounded-2xl border p-5 ${tone === 'orange' ? 'border-accent/20 bg-accent/8' : tone === 'cream' ? 'border-secondary/60 bg-secondary/30' : 'border-primary/15 bg-primary/[.045]'}`} data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="mb-6 flex items-start justify-between"><span className="text-sm font-medium text-muted-foreground">{label}</span><Icon className={`size-5 ${tone === 'orange' ? 'text-accent' : 'text-primary'}`} /></div><div className="display text-4xl font-bold">{value}</div>{note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}</div>;
}

export function RiskBadge({ risk }: { risk?: string | null }) {
  const text = risk || 'Pending';
  const cls = text === 'HIGH' || text === 'CRITICAL' ? 'bg-destructive/10 text-destructive' : text === 'MODERATE' ? 'bg-accent/12 text-accent' : text === 'LOW' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${cls}`} data-testid={`status-risk-${text.toLowerCase()}`}>{text.toLowerCase()}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status === 'COMPLETED' ? 'text-primary' : status === 'FAILED' ? 'text-destructive' : 'text-muted-foreground'}`} data-testid={`status-advisory-${status.toLowerCase()}`}><span className={`size-1.5 rounded-full ${status === 'COMPLETED' ? 'bg-primary' : status === 'FAILED' ? 'bg-destructive' : 'bg-accent animate-breathe'}`} />{status.toLowerCase()}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="display text-2xl font-bold">{children}</h2>{action}</div>;
}

export function ActivityRow({ item, compact = false }: { item: { id: string; cropName: string; location: string; mainConcern: string; createdAt: string; status: string; riskLevel?: string | null }; compact?: boolean }) {
  return <Link href={`/advisory/${item.id}`} className="group flex items-center gap-4 border-b border-border/70 py-4 last:border-0" data-testid={`link-advisory-${item.id}`}><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/75 text-primary"><Sprout className="size-[18px]" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.cropName}</p><RiskBadge risk={item.riskLevel} /></div><p className="mt-1 truncate text-xs text-muted-foreground">{item.mainConcern} · {item.location}</p></div><div className={`hidden text-right sm:block ${compact ? 'sm:hidden' : ''}`}><p className="mono text-[10px] uppercase tracking-wide text-muted-foreground">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p><StatusBadge status={item.status} /></div><ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" /></Link>;
}

export function AuthFrame({ children }: { children: ReactNode }) {
  return <div className="paper-grain min-h-[100dvh] bg-background"><div className="grid min-h-[100dvh] lg:grid-cols-[.9fr_1.1fr]"><div className="hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between"><Logo inverse /><div><div className="mb-5 size-16 rounded-[22px] bg-sidebar-primary/15 p-4 text-sidebar-primary"><Leaf className="size-full" /></div><h1 className="display max-w-md text-5xl font-bold leading-[1.05]">A quieter way to decide what your crop needs.</h1><p className="mt-6 max-w-sm text-base leading-7 text-sidebar-foreground/60">Fieldnote turns what you see in the field into careful, practical next steps.</p></div><p className="mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/35">Built for the next morning in the field</p></div><div className="flex flex-col items-center justify-center px-5 py-10"><div className="mb-8 lg:hidden"><Logo /></div>{children}</div></div></div>;
}