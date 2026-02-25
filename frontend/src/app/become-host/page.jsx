"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUploader } from "@/hooks/useUploader";

const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function BecomeHostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [files, setFiles] = useState({});
  const [progress, setProgress] = useState({
    front: 0,
    back: 0,
    selfie: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { upload: uploadFile } = useUploader();

  /* ---------------- SESSION REDIRECT HANDLING ---------------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>正在加载会话...</p>
      </div>
    );
  }

  if (
    session?.user?.role === "HOST" ||
    session?.user?.role === "PENDING_HOST"
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">申请状态</h1>
          <p className="mt-2">
            您已经是{" "}
            {session.user.role === "HOST" ? "房东" : "待审核的房东"}。
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            前往仪表盘
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- FILE VALIDATION ---------------- */
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("Error: Only JPG, JPEG, and PNG files are allowed.");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage(`Error: File size cannot exceed ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    setMessage("");
    if (file && validateFile(file)) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const handleFilePick = (e, key) => {
    const file = e.target.files?.[0];
    setMessage("");
    if (file && validateFile(file)) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = async () => {
    setMessage("");
    if (!files.front || !files.back || !files.selfie) {
      setMessage("Error: Please upload all three images (front, back, and selfie).");
      return;
    }

    setSubmitting(true);

    try {
      // Use Promise.all to upload files concurrently
      const uploadPromises = [
        uploadFile(files.front, "front"),
        uploadFile(files.back, "back"),
        uploadFile(files.selfie, "selfie"),
      ];

      const results = await Promise.all(uploadPromises);

      const uploadedKeys = {
        frontKey: results[0].filePath,
        backKey: results[1].filePath,
        selfieKey: results[2].filePath,
      };

      const gqlRes = await fetch("/api/graphql", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation BecomeHost($frontKey: String!, $backKey: String!, $selfieKey: String!) {
              becomeHost(frontKey: $frontKey, backKey: $backKey, selfieKey: $selfieKey) {
                success
                message
              }
            }
          `,
          variables: uploadedKeys,
        }),
      });

      const result = await gqlRes.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const becomeHostResult = result.data.becomeHost;
      if (becomeHostResult.success) {
        setMessage(`Success: ${becomeHostResult.message}`);
        // Optionally, redirect the user after a short delay
        // setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        throw new Error(becomeHostResult.message || "An unknown error occurred.");
      }
    } catch (err) {
      setMessage(`Error: ${err.message || "An unexpected error occurred."}`);
    }

    setSubmitting(false);
  };

  /* ---------------- REUSABLE DROP AREA ---------------- */
  const renderDrop = (label, key) => (
    <div
      className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:border-blue-500 transition bg-gray-50"
      onDrop={(e) => handleFileDrop(e, key)}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="font-semibold text-gray-600">{label}</p>

      {files[key] ? (
        <p className="text-green-600 mt-2">{files[key].name}</p>
      ) : (
        <p className="text-gray-400 text-sm mt-2">
          Drag & Drop or Click to Upload
        </p>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilePick(e, key)}
      />

      {progress[key] > 0 && (
        <div className="w-full bg-gray-200 rounded mt-2">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${progress[key]}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  /* ---------------- MAIN PAGE UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              🏠 MINSHUKU
            </Link>
            <nav className="space-x-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/listings" className="hover:underline">
                Listings
              </Link>
              {status === "authenticated" ? (
                <button
                  onClick={() => router.push("/api/auth/signout")}
                  className="hover:underline"
                >
                  登出
                </button>
              ) : (
                <Link href="/api/auth/signin" className="hover:underline">
                  登录
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a Host
          </h1>
          <p className="text-xl md:text-2xl mb-6">
            Turn your extra space into extra income
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <h2 className="text-2xl font-bold">Verify Your MyNumber Card</h2>
              <p className="text-blue-100">
                完成 MyNumber 身份验证即可成为房东
              </p>
            </div>

            {/* --- MESSAGE DISPLAY --- */}
            {message && (
              <div
                className={`p-4 mb-6 rounded-md text-sm ${
                  message.startsWith("Error:")
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >{message}</div>
            )}

            {/* --- MERGED UPLOAD UI HERE --- */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderDrop("Card Front (正面)", "front")}
                {renderDrop("Card Back (背面)", "back")}
              </div>

              {renderDrop("Selfie Holding Card (自拍+卡)", "selfie")}

              <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mt-4"
              >
                {submitting ? "Uploading..." : "Submit Verification"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-500 text-white py-8 text-center">
        MINSHUKU © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
