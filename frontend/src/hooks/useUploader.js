"use client";

import { useState } from "react";

export function useUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Gets a presigned URL from the backend via our Next.js API route proxy.
   */
  const getPresignedUrl = async (file, key) => {
    const res = await fetch(`/api/presign-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileType: file.type,
        key: key,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: "No body" }));
      throw new Error(errorBody.error || "Failed to get presigned URL.");
    }

    const responseData = await res.json();
    return { uploadUrl: responseData.uploadUrl, filePath: responseData.filePath };
  };

  /**
   * Uploads a file to a presigned Google Cloud Storage URL.
   */
  const upload = async (file, key) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setData(null);

    try {
      const { uploadUrl, filePath } = await getPresignedUrl(file, key);

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) throw new Error("Upload to cloud storage failed.");

      setProgress(100);
      setData({ filePath });
      return { filePath };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { upload, isLoading, progress, error, data };
}