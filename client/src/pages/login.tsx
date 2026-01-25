import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AnimatedLogo } from "@/components/animated-logo";
import { ArrowLeft, Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiGoogle } from "react-icons/si";
import { SEOHead, seoData } from "@/components/seo-head";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      const messages: Record<string, string> = {
        google_auth_failed: "Google sign-in failed. Your Google account may not be authorized. Please try email/password login or contact the administrator.",
        google_auth_error: "An error occurred during Google sign-in. Please try again.",
        session_error: "Failed to create session after Google sign-in. Please try again.",
      };
      toast({
        title: "Sign-in Error",
        description: messages[error] || `Authentication failed: ${error}`,
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/login");
    }
  }, []);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast({ title: "Error", description: data.message || "Something went wrong", variant: "destructive" });
          return;
        }
        setForgotSent(true);
        return;
      }

      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: data.message || "Something went wrong", variant: "destructive" });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={seoData.login.title} description={seoData.login.description} keywords={seoData.login.keywords} canonicalUrl="https://myuserjourney.co.uk/login" />
      <header className="flex items-center justify-between gap-4 px-6 py-3 border-b">
        <Link href="/landing">
          <Button variant="ghost" size="sm" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <AnimatedLogo size="lg" showText={true} />
            </div>
            <CardTitle className="text-2xl" data-testid="text-login-title">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Reset your password"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your account to continue" : mode === "register" ? "Get started with your analytics platform" : "Enter your email and we'll send you a reset link"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "forgot" ? (
              forgotSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium" data-testid="text-reset-sent">Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      If an account with that email exists, we've sent a password reset link. The link expires in 1 hour.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setMode("login"); setForgotSent(false); }}
                    data-testid="button-back-to-login"
                  >
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="pl-9"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading} data-testid="button-submit-forgot">
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Send Reset Link
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-primary underline"
                      data-testid="button-back-to-login"
                    >
                      Back to sign in
                    </button>
                  </p>
                </form>
              )
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleGoogleLogin}
                  data-testid="button-google-login"
                >
                  <SiGoogle className="h-4 w-4 mr-2" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName">First name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            className="pl-9"
                            data-testid="input-first-name"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="pl-9"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Label htmlFor="password">Password</Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs text-primary underline"
                          data-testid="button-forgot-password"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                        required
                        minLength={mode === "register" ? 6 : 1}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="pl-9 pr-9"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading} data-testid="button-submit-auth">
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <p className="text-sm text-center text-muted-foreground">
                  {mode === "login" ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => setMode("register")}
                        className="text-primary underline"
                        data-testid="button-switch-register"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => setMode("login")}
                        className="text-primary underline"
                        data-testid="button-switch-login"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
