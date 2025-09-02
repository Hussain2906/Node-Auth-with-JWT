import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginWithEmailPassword,
  selectAuthStatus,
  selectAuthError,
  selectIsLoggedIn,
} from "../../Features/auth/AuthSlice";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isIn = useSelector(selectIsLoggedIn);

  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");

  if (isIn) return <Navigate to="/" replace />;

  async function doLogin(e) {
    e.preventDefault();
    await dispatch(loginWithEmailPassword({ emailValue: email, passwordValue: pass }));
  }


  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={doLogin}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In</h1>
          <p className="text-sm">Welcome back! Sign in to continue</p>

          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">
                  Password
                </Label>
                <Button asChild variant="link" size="sm">
                  <span className="text-sm">Forgot your Password ?</span>
                </Button>
              </div>
              <Input
                type="password"
                required
                name="pwd"
                id="pwd"
                className="input sz-md variant-mixed"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Loading..." : "Sign In"}
            </Button>
          </div>
        </div>

        {error && <div className="px-8 text-red-600 text-sm">{error}</div>}

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don't have an account ?
            <Link to='/signup' className="text-blue-600 hover:underline px-2">
            Create Account ?
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}
