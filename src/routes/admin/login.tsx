import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Campus Events" },
      { name: "description", content: "Sign in to manage college event categories and listings." },
      { property: "og:title", content: "Admin Sign In — Campus Events" },
      { property: "og:description", content: "Administrator access for the campus events portal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | undefined; password?: string | undefined; form?: string | undefined }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authApi.getSession()) navigate({ to: "/admin/dashboard" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await authApi.login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/admin/dashboard" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Sign in failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Northfield College</h1>
          <p className="mt-1 text-sm text-muted-foreground">Event administration portal</p>
        </div>

        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-lg border border-border bg-background p-6 shadow-soft"
        >
          {errors.form ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive"
            >
              {errors.form}
            </p>
          ) : null}

          <div>
            <Label htmlFor="email" className="mb-1.5 text-xs font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="admin@college.edu"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <p className="mt-1.5 text-xs text-destructive">{errors.email}</p> : null}
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 text-xs font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                className="pr-10"
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Demo credentials: {authApi.demoCredentials.email} / {authApi.demoCredentials.password}
          </p>
        </form>
      </div>
    </div>
  );
}
