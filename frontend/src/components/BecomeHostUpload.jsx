//src/components/BecomeHostUpload.jsx
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg","image/jpg", "image/png"];
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

export default function BecomeHostUpload() {
  const [files, setFiles] = useState({});
  const [progress, setProgress] = useState({ front: 0, back: 0, selfie: 0 });
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG allowed");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Max ${MAX_SIZE_MB}MB`);
      return false;
    }
    return true;
  };

  const handleFileDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const handleFilePick = (e, key) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

const getPresignedUrl = async (filePath, contentType) => {
  const res = await fetch(`${GATEWAY_URL}/file/presign-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filePath,
      contentType,
    }),
  });

  if (!res.ok) throw new Error("Presign failed");
  return res.json();
};

const uploadToPresignedUrl = async (file, name) => {
  const timestamp = Date.now();
  const ext = file.name.split(".").pop();
  const filePath = `mynumber/${session.user.id}/${name}-${timestamp}.${ext}`;

  // Ask backend for signed URL
  const { uploadUrl } = await getPresignedUrl(filePath, file.type);

  // Upload directly to GCS
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) throw new Error("Upload failed");

  setProgress((prev) => ({ ...prev, [name]: 100 }));

  return filePath;
};



  const onSubmit = async () => {
    if (!files.front || !files.back || !files.selfie) {
      alert("All images required: Front, Back, Selfie");
      return;
    }

    setSubmitting(true);

    try {
      const uploadedKeys = {
        frontKey: await uploadToPresignedUrl(files.front, "front"),
        backKey: await uploadToPresignedUrl(files.back, "back"),
        selfieKey: await uploadToPresignedUrl(files.selfie, "selfie"),
      };

      const gqlRes = await fetch(`${GATEWAY_URL}/graphql`, { // Use GATEWAY_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation BecomeHost($input: BecomeHostInput!) {
              becomeHost(input: $input) {
                success
                message
              }
            }
          `,
          variables: { input: uploadedKeys },
        }),
      });

      const result = await gqlRes.json();
      alert(result.data.becomeHost.message);
      // TODO: Redirect user or update UI to show "Pending" status
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setSubmitting(false);
  };

  const renderDrop = (label, key) => (
    <label
      htmlFor={`file-upload-${key}`} // Associate label with input for accessibility
      className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer
                hover:border-blue-500 transition bg-gray-50"
      onDrop={(e) => handleFileDrop(e, key)}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="font-semibold text-gray-600">{label}</p>
      {files[key] ? (
        <p className="text-green-600 mt-2">{files[key].name}</p>
      ) : (
        <p className="text-gray-400 text-sm mt-2">Drag & Drop or Click</p>
      )}
      <input
        type="file"
        id={`file-upload-${key}`}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilePick(e, key)}
      />
      {progress[key] > 0 && (
        <div className="w-full bg-gray-200 rounded mt-2">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${progress[key]}%` }}
          />
        </div>
      )}
    </label>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-center">
        My Number Card Verification
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"> {/* Removed onClick from here */}
        {renderDrop("Front of Card", "front")}
        {renderDrop("Back of Card", "back")}
      </div>

      {renderDrop("Selfie Holding Card", "selfie")}

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold
                   hover:bg-blue-700 disabled:opacity-50 mt-4"
      >
        {submitting ? "Uploading..." : "Submit Verification"}
      </button>
    </div>
  );
}
