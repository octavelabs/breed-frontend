"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TickCircle, CloseCircle, InfoCircle } from "iconsax-react";
import { authService } from "../../lib/api-services";

type Status = "loading" | "success" | "error" | "missing";

function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <a href="https://joinbreed.com">
        <img src="/Logo.png" alt="Breed" className="h-[30px] w-[80px] object-contain" />
      </a>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#f8edfe] flex flex-col items-center justify-center px-4">
      <Logo />
      <div className="bg-white rounded-[24px] shadow-sm p-8 max-w-md w-full text-center">
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
            <TickCircle size={64} color="#22c55e" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your account is now active. Redirecting you to login…
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <CloseCircle size={64} color="#f87171" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">
              {message || "This link is invalid or has expired. Please request a new verification email."}
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Back to Login
            </Link>
          </>
        )}

        {status === "missing" && (
          <>
            <InfoCircle size={64} color="#eab308" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-500 text-sm mb-6">
              No verification token was found in this link. Please use the link from your email.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
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
    <Suspense fallback={<div className="min-h-screen bg-[#f8edfe]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
