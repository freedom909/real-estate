"use client";

import { useState } from "react";
import Image from "next/image";

export default function VerifyMyNumberPage() {
  const [files, setFiles] = useState({
    front: null,
    back: null,
    selfie: null,
  });

  const [uploadProgress, setUploadProgress] = useState({
    front: 0,
    back: 0,
    selfie: 0,
  });

  const [message, setMessage] = useState("");
  const [similarity, setSimilarity] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // 1. Drag-and-Drop Upload UI
  // -----------------------------
  const FileUploadBox = ({
    label,
    type,
  })=> {
    const currentFile = files[type];

    const handleSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFiles((prev) => ({ ...prev, [type]: file }));
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      setFiles((prev) => ({ ...prev, [type]: file }));
    };

    return (
      <div className="border rounded-xl p-4 bg-white shadow-sm mb-4">
        <h3 className="text-lg font-semibold mb-2">{label}</h3>

        <div
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-gray-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {currentFile ? (
            <div className="flex flex-col items-center">
              <p className="text-sm text-green-600">{currentFile.name}</p>

              <progress
                value={uploadProgress[type]}
                max="100"
                className="w-full mt-2"
              />

              <Image
                src={URL.createObjectURL(currentFile)}
                alt={label}
                width={120}
                height={80}
                className="mt-3 rounded-md object-cover"
              />
            </div>
          ) : (
            <p className="text-gray-500">拖拽或点击上传</p>
          )}

          <input type="file" accept="image/*" className="hidden" onChange={handleSelect} />
        </div>
      </div>
    );
  };

  // -----------------------------
  // 2. Request Presigned URL → Upload
  // -----------------------------
  const uploadToS3 = async (file, type) => {
    // 1. Get GraphQL Presigned URL
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation GetPresigned($input: PresignedInput!) {
            getPresignedUrl(input: $input) {
              url
              key
              success
            }
          }
        `,
        variables: {
          input: {
            fileName: file.name,
            contentType: file.type,
          },
        },
      }),
    }).then((r) => r.json());

    const { url, key } = res.data.getPresignedUrl;

    // 2. Upload directly to S3
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return key;
  };

  // -----------------------------
  // 3. Call verifyMyNumber API
  // -----------------------------
  const handleVerify = async () => {
    if (!files.front || !files.selfie) {
      alert("正面照片 / 自拍照 必须上传");
      return;
    }

    setLoading(true);
    setMessage("");

    // Upload all images
    const frontKey = await uploadToS3(files.front, "front");
    const backKey = files.back ? await uploadToS3(files.back, "back") : null;
    const selfieKey = await uploadToS3(files.selfie, "selfie");

    // Send to backend
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation Verify($frontKey: String!, $selfieKey: String!) {
            verifyMyNumber(frontKey: $frontKey, selfieKey: $selfieKey) {
              success
              similarity
              message
            }
          }
        `,
        variables: {
          frontKey,
          selfieKey,
        },
      }),
    }).then((r) => r.json());

    const result = res.data.verifyMyNumber;

    setSimilarity(result.similarity);
    setMessage(result.message);
    setLoading(false);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">MyNumber 身份验证</h1>

      <FileUploadBox label="📄 身份证（正面）" type="front" />
      <FileUploadBox label="📄 身份证（背面）" type="back" />
      <FileUploadBox label="🤳 自拍照（必须）" type="selfie" />

      <button
        onClick={handleVerify}
        className="w-full bg-blue-600 text-white py-3 rounded-xl mt-4 text-lg"
        disabled={loading}
      >
        {loading ? "验证中…" : "开始验证"}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
          <p>{message}</p>
          {similarity !== null && (
            <p className="text-sm text-gray-500 mt-1">similarity: {similarity.toFixed(4)}</p>
          )}
        </div>
      )}
    </div>
  );
}
