import Link from "next/link";
import { signIn, signInWithGoogle, signOut, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mb-4">
            Money<span className="text-primary">Mitra</span>
          </Link>
          <CardTitle>{params.next === "/advisor" ? "Officer Login" : "Welcome to MoneyMitra"}</CardTitle>
          <CardDescription>{params.next === "/advisor" ? "Authorized bank officers sign in here to access the Officer Portal." : "Sign in or create an account to keep your financial data private."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {params.error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p>}
          {params.message && <p className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{params.message}</p>}
          {user && (
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
              <p>Currently signed in as <strong>{user.email}</strong>.</p>
              <p className="mt-1 text-xs text-muted-foreground">Sign in below to switch accounts.</p>
              <form action={signOut} className="mt-3">
                <Button type="submit" variant="outline" size="sm">Sign out current account</Button>
              </form>
            </div>
          )}
          <form action={signIn} className="space-y-3">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <Button type="submit" variant="outline" className="w-full">Continue with Google</Button>
          </form>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center text-sm">
            <p className="font-semibold">Are you a Financial Wellbeing Officer?</p>
            <Link href="/auth?next=/advisor" className="mt-1 inline-block text-primary hover:underline">
              Use Officer Login
            </Link>
          </div>
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
