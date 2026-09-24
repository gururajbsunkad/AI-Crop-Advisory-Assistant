import { Link } from 'wouter';
import { ArrowLeft, Leaf } from 'lucide-react';

export default function NotFound() {
  return <div className="paper-grain flex min-h-[100dvh] items-center justify-center bg-background px-5">
    <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-8 text-center shadow-[0_20px_60px_hsl(147_25%_18%/.08)] md:p-12">
      <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Leaf className="size-7" /></div>
      <p className="mono text-[10px] uppercase tracking-[.2em] text-accent">Field path not found</p>
      <h1 className="display mt-3 text-4xl font-bold">This page wandered off.</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">The note you are looking for may have moved. Let us bring you back to your field desk.</p>
      <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground" data-testid="link-not-found-home"><ArrowLeft className="size-4" />Back to Fieldnote</Link>
    </div>
  </div>;
}