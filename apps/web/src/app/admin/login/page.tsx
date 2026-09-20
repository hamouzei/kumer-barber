"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Eye, EyeOff, Loader2, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { login } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/admin");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand px-4 py-12">
      {/* Top Floating Return to Homepage Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-linen/10 bg-charcoal/90 px-4 py-2 text-xs font-medium text-linen/70 backdrop-blur-md transition-all hover:border-brass/40 hover:bg-charcoal hover:text-brass shadow-lg group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Decorative grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />

      <Card className="relative z-10 w-full max-w-sm border-linen/10 bg-charcoal shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brass/10">
            <Scissors className="h-6 w-6 text-brass" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-linen">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-linen/50">
              Sign in to manage your barber shop
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-linen/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-linen/10 bg-linen/5 text-linen placeholder:text-linen/30 focus-visible:ring-brass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-linen/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="border-linen/10 bg-linen/5 text-linen placeholder:text-linen/30 pr-10 focus-visible:ring-brass"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-linen/30 hover:text-linen/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-brass text-brand hover:bg-brass-light font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer Return to Homepage Link */}
          <div className="mt-6 pt-4 border-t border-linen/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-linen/50 hover:text-brass transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Return to Kumer Barbershop Website</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
