import Link from "next/link";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mb-4">
            Money<span className="text-primary">Mitra</span>
          </Link>
          <CardTitle>Welcome to MoneyMitra</CardTitle>
          <CardDescription>Sign in or create an account to keep your financial data private.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {params.error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p>}
          {params.message && <p className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{params.message}</p>}
          <form action={signIn} className="space-y-3">
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="border-t border-border pt-6">
            <p className="mb-3 text-sm font-semibold">New to MoneyMitra?</p>
            <form action={signUp} className="space-y-3">
              <input name="fullName" required placeholder="Full name" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input name="password" type="password" required minLength={6} placeholder="Password (6+ characters)" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <Button type="submit" variant="outline" className="w-full">Create account</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
