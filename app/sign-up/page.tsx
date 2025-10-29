"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function SignUpContent() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: returnTo || "/dashboard",
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: () => {
            toast.success("Account created successfully!");
            router.push(returnTo || "/dashboard");
          },
          onError: (ctx) => {
            setLoading(false);
            console.error("Sign-up error:", ctx.error);
            toast.error(ctx.error.message || "Failed to create account");
          },
        },
      );
    } catch (error) {
      setLoading(false);
      console.error("Sign-up failed:", error);
      toast.error("Failed to create account. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: returnTo || "/dashboard",
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onResponse: () => {
            setLoading(false);
          },
          onError: (ctx) => {
            setLoading(false);
            console.error("Google sign-up error:", ctx.error);
            toast.error("Failed to sign up with Google");
          },
        },
      );
    } catch (error) {
      setLoading(false);
      console.error("Google sign-up failed:", error);
      toast.error("Failed to sign up with Google");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen py-12 px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Create your Snaptastic account
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Get 3 free credits to start restoring your memories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="grid gap-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 8 characters)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
                required
                minLength={8}
              />
            </div>

            {/* Sign Up Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className={cn("w-full gap-2")}
              disabled={loading}
              onClick={handleGoogleSignUp}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Sign up with Google
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="underline hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400 max-w-md">
        By signing up, you agree to our{" "}
        <Link
          href="/terms-of-service"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy-policy"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen">
          <div className="max-w-md w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg h-96"></div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
