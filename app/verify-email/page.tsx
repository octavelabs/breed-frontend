"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "../../lib/api-services";

type Status = "loading" | "success" | "error" | "missing";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        // Redirect to login after 3 seconds
        setTimeout(() => router.push("/login?verified=true"), 3000);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Verification failed. The link may have expired.";
        setMessage(msg);
        setStatus("error");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#FBF6FF] flex items-center justify-center px-4">
      <div className="bg-white rounded-[24px] shadow-sm p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="w-[52px] h-[52px] rounded-full bg-[#FBF6FF] mb-6 flex justify-center items-center mx-auto">
          <img src="/heroImage2.svg" alt="Breed" className="w-[36px] h-[36px]" />
        </div>

        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email…</h2>
            <p className="text-gray-500 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your account is now active. Redirecting you to login…
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-sm"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">
              {message || "This link is invalid or has expired. Please request a new verification email."}
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-sm"
            >
              Back to Login
            </Link>
          </>
        )}

        {status === "missing" && (
          <>
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-500 text-sm mb-6">
              No verification token was found in this link. Please use the link from your email.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-sm"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF6FF]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
