"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Hero Section */}
        <div className="text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Connect with <span className="text-[#4A90E2]">Professionals</span> Worldwide
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
            Join our professional network to connect, collaborate, and grow your career with like-minded individuals.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => setFlow("signUp")}
              className="px-8 py-3 bg-[#4A90E2] text-white rounded-lg font-semibold hover:bg-[#357ABD] transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
            <button
              onClick={() => setFlow("signIn")}
              className="px-8 py-3 bg-white text-[#4A90E2] rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {flow === "signIn" ? "Welcome Back" : "Create Account"}
          </h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitting(true);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                let toastTitle = "";
                if (error.message.includes("Invalid password")) {
                  toastTitle = "Invalid password. Please try again.";
                } else {
                  toastTitle =
                    flow === "signIn"
                      ? "Could not sign in, did you mean to sign up?"
                      : "Could not sign up, did you mean to sign in?";
                }
                toast.error(toastTitle);
                setSubmitting(false);
              });
            }}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all duration-200"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all duration-200"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              className="w-full px-4 py-3 bg-[#4A90E2] text-white rounded-lg font-semibold hover:bg-[#357ABD] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </button>
            <div className="text-center text-sm text-gray-600">
              <span>
                {flow === "signIn"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                className="text-[#4A90E2] hover:text-[#357ABD] font-medium hover:underline transition-colors duration-200"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <button
              className="mt-4 w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
              onClick={() => void signIn("anonymous")}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
