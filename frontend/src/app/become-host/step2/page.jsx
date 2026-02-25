"use client";

import React, { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BecomeHostStep2() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const GATEWAY_URL =
    process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [dragActiveFront, setDragActiveFront] = useState(false);
  const [dragActiveBack, setDragActiveBack] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ---------------------------------------------
  // Handle Drag + Drop
  // ---------------------------------------------
  const onDrop = useCallback((e, type) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg("File size must be < 5MB");
      return;
    }

    type === "front" ? setFront(file) : setBack(file);
  }, []);

  const onDragOver = (e) => e.preventDefault();

  // ---------------------------------------------
  // Upload file to GCS via presigned URL
  // ---------------------------------------------
  const uploadFile = async (file, label) => {
    const presignRes = await fetch(`${GATEWAY_URL}/file/presign-url`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileType: file.type,
        key: label, // Send the label ('front' or 'back') as the key
      }),
    });

    if (!presignRes.ok) {
      throw new Error(`Failed to get presigned URL for ${label}`);
    }

    const { uploadUrl, filePath} = await presignRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`GCS upload failed (${label})`);
    }

    return filePath;
  };

  // ---------------------------------------------
  // Submit Step 2
  // ---------------------------------------------
  const handleSubmit = async () => {
    if (!front || !back) {
      setMsg("Please upload BOTH front and back images.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // Upload images
      const [frontKey, backKey] = await Promise.all([
        uploadFile(front, "front"),
        uploadFile(back, "back"),
      ]);

      // Call GraphQL
      const mutation = `
        mutation BecomeHost($userId: ID!, $myNumberCardFront: String!, $myNumberCardBack: String!) {
          becomeHost(
            userId: $userId,
            myNumberCardFront: $myNumberCardFront,
            myNumberCardBack: $myNumberCardBack
          ) {
            success
            message
            user {
              id
              role
              status
            }
          }
        }
      `;

      const res = await fetch(`${GATEWAY_URL}/graphql`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            userId: session.user.id,
            myNumberCardFront: frontKey,
            myNumberCardBack: backKey,
          },
        }),
      });

      const result = await res.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data.becomeHost.success) {
        await updateSession();
        router.push("/become-host/step3");
      } else {
        setMsg(result.data.becomeHost.message);
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="max-w-2xl mx-auto pt-10 pb-20">
      <h1 className="text-3xl font-bold mb-2">Step 2: Upload My Number Card</h1>
      <p className="text-gray-600 mb-6">
        Please upload the **front and back** of your My Number Card.
      </p>

      {msg && (
        <div className="p-3 rounded bg-red-100 text-red-700 mb-4">{msg}</div>
      )}

      {/* FRONT */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
          dragActiveFront ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, "front")}
        onDragEnter={() => setDragActiveFront(true)}
        onDragLeave={() => setDragActiveFront(false)}
      >
        <p className="font-medium mb-2">Front Side *</p>

        {front ? (
          <>
            <p className="text-green-600">✓ {front.name}</p>
            <button
              onClick={() => setFront(null)}
              className="text-red-600 text-sm underline mt-2"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm">Drag & drop, or choose file</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFront(e.target.files?.[0] || null)}
              className="mt-3"
            />
          </>
        )}
      </div>

      {/* BACK */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
          dragActiveBack ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, "back")}
        onDragEnter={() => setDragActiveBack(true)}
        onDragLeave={() => setDragActiveBack(false)}
      >
        <p className="font-medium mb-2">Back Side *</p>

        {back ? (
          <>
            <p className="text-green-600">✓ {back.name}</p>
            <button
              onClick={() => setBack(null)}
              className="text-red-600 text-sm underline mt-2"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm">Drag & drop, or choose file</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBack(e.target.files?.[0] || null)}
              className="mt-3"
            />
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit and Continue →"}
      </button>
    </div>
  );
}
