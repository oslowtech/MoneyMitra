import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-background p-4 text-foreground sm:p-8">
      <header className="relative flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 py-3 sm:absolute sm:top-0 sm:p-6">
        <div className="text-xl font-bold tracking-tight sm:text-2xl">
          Money<span className="text-primary">Mitra</span>
        </div>
        <nav className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/ps4-engine" className="hover:text-primary transition-colors">PS4 Engine</Link>
          <Link href="/company" className="hover:text-primary transition-colors">Company</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/auth" className="text-xs font-medium hover:text-primary transition-colors sm:text-sm">Log in</Link>
          <Link href="/auth" className={buttonVariants({ className: "rounded-full px-3 text-xs font-bold sm:px-6 sm:text-sm" })}>Sign up</Link>
        </div>
      </header>

      <main className="mt-10 flex w-full max-w-5xl flex-col items-center justify-center text-center sm:mt-20">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground sm:px-4 sm:text-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Fast, Secure, Irregular Income Intelligence.</span>
        </div>
        
        <h1 className="mb-6 text-4xl font-black tracking-tighter sm:text-6xl md:text-8xl">
          <span className="text-primary">GIG</span> WORKER
          <br /> FINANCIAL HEALTH
        </h1>
        
        <p className="mb-8 max-w-2xl text-base text-muted-foreground sm:mb-10 sm:text-lg md:text-xl">
          Send money anywhere in the world instantly with low fees and top-notch security. MoneyMitra specializes in managing irregular income.
        </p>
        
        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Link href="/onboarding" className={buttonVariants({ size: "lg", className: "h-12 w-full rounded-full px-5 text-sm font-bold sm:w-auto sm:px-8 sm:text-md" })}>Start Planning Now &rarr;</Link>
          <Link href="/guide" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 w-full rounded-full border-border bg-transparent px-5 text-sm font-bold hover:bg-secondary sm:w-auto sm:px-8 sm:text-md" })}>See how it works</Link>
        </div>
      </main>
    </div>
  );
}
