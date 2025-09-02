import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupWithEmailPassword, selectAuthStatus, selectAuthError, selectIsLoggedIn } from "../../Features/auth/AuthSlice";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isIn = useSelector(selectIsLoggedIn);

  const [firstname, setFirstname] = React.useState("");
  const [lastname, setLastname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");

  if (isIn) return <Navigate to="/" replace />;

  async function doSignup(e) {
    e.preventDefault();
    await dispatch(signupWithEmailPassword({ emailValue: email, passwordValue: pass }));
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={doSignup}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <h1 className="mb-1 mt-4 text-xl font-semibold">Create an Account</h1>
          <p className="text-sm">Welcome! Fill in the details below</p>

          <hr className="my-4 border-dashed" />

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="block text-sm">Firstname</Label>
                <Input type="text" id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="block text-sm">Lastname</Label>
                <Input type="text" id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">Email</Label>
              <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pwd" className="text-sm">Password</Label>
              <Input type="password" id="pwd" value={pass} onChange={(e) => setPass(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Creating..." : "Sign Up"}
            </Button>
          </div>
        </div>

        {error && <div className="px-8 text-red-600 text-sm">{error}</div>}

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </form>
    </section>
  );
}
