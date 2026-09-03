import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center p-8">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-6xl">
        <div className="text-2xl font-bold tracking-tight">
          Money<span className="text-primary">Mitra</span>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm text-muted-foreground font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/health" className="hover:text-primary transition-colors">PS4 Engine</Link>
          <Link href="/advisor" className="hover:text-primary transition-colors">Company</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
          <Link href="/auth?next=/advisor" className="text-sm font-medium text-primary hover:underline transition-colors">Officer Login</Link>
          <Link href="/auth" className={buttonVariants({ className: "rounded-full font-bold px-6" })}>Sign up free</Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center mt-20">
        <div className="inline-flex items-center space-x-2 bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Fast, Secure, Irregular Income Intelligence.</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
          <span className="text-primary">GIG</span> WORKER
          <br /> FINANCIAL HEALTH
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Send money anywhere in the world instantly with low fees and top-notch security. MoneyMitra specializes in managing irregular income.
        </p>
        
        <div className="flex items-center space-x-4">
          <Link href="/onboarding" className={buttonVariants({ size: "lg", className: "rounded-full font-bold px-8 h-12 text-md" })}>Start Planning Now &rarr;</Link>
          <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline", className: "rounded-full font-bold px-8 h-12 text-md bg-transparent border-border hover:bg-secondary" })}>See how it works</Link>
        </div>
      </main>
    </div>
  );
}
