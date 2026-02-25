"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BecomeHostStep3() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading account...</p>
      </div>
    );
  }

  const role = session?.user?.role;

  // If user is already HOST, don't show pending page
  if (role === "HOST") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold mb-4">You are already a Host 🎉</h1>
        <Link
          href="/dashboard"
          className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-32 px-4">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-lg text-center">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-14 h-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">Application Submitted</h1>

        <p className="text-lg text-gray-700 mb-2">
          Thank you for submitting your host application!
        </p>

        <p className="text-gray-600 mb-6">
          Our team is now reviewing your information. This usually takes
          <span className="font-semibold"> 1–3 business days</span>.
        </p>

        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-8">
          <p>
            <strong>Status:</strong>{" "}
            {role === "PENDING_HOST"
              ? "Pending Review"
              : "Waiting for Verification"}
          </p>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-10">
          <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
          <ul className="space-y-3 text-gray-700">
            <li>✔ We verify your identity & MyNumber Card</li>
            <li>✔ You will receive an email when the review is complete</li>
            <li>✔ Once approved, you can start creating listings immediately</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-center"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
