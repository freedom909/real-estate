//frontend/src/components/MyNumberUploadForm.jsx

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { gql, useMutation } from '@apollo/client';

const BECOME_HOST = gql`
  mutation BecomeHost($input: BecomeHostInput!) {
    becomeHost(input: $input) {
      success
      message
    }
  }
`;


const allowedTypes = ['image/jpeg', 'image/png'];
const maxSizeMB = 10;

export default function MyNumberUploadForm() {
  const [files, setFiles] = useState<{ [key in UploadType]: File }>({});
  const [progress, setProgress] = useState<{ [key in UploadType]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const [becomeHost] = useMutation(BECOME_HOST);

  // Validate file
  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG/PNG allowed.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Max file size: ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  // Upload using presign URL
  async function uploadToPresignedUrl(file, type){
    const res = await fetch('/file/presign-url', {
      method: 'POST',
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ fileType: type }),
    });

    const { uploadUrl, key } = await res.json();
    if (!uploadUrl) throw new Error('Failed presign.');

    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    return key;
  }

  const handleDrop = (type) => (e) => {
    e.preventDefault();
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setFiles(prev => ({ ...prev, [type]: file }));
  };

  async function handleSubmit() {
    setError(null);

    if (!files.front || !files.back || !files.selfie) {
      setError('Please upload all 3 images.');
      return;
    }

    try {
      const uploadedKeys = {
        frontKey: await uploadToPresignedUrl(files.front, 'front'),
        backKey: await uploadToPresignedUrl(files.back, 'back'),
        selfieKey: await uploadToPresignedUrl(files.selfie, 'selfie'),
      };

      const result = await becomeHost({
        variables: { input: uploadedKeys }
      });

      alert(result.data.becomeHost.message);
    } catch (err) {
      console.error(err);
      setError('Upload failed.');
    }
  }

  const renderDropBox = (
    type,
    label,
    preview = false
  ) => (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop(type)}
      className="flex flex-col justify-center items-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 w-full h-40 text-center"
    >
      {files[type] ? (
        <Image
          src={URL.createObjectURL(files[type])}
          width={120}
          height={80}
          className="object-cover rounded-md"
          alt={`${label} preview`}
        />
      ) : (
        <span className="text-sm text-gray-500">{label}</span>
      )}

      {progress[type] !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="h-2 bg-blue-500 rounded-full"
            style={{ width: `${progress[type]}%` }}
          ></div>
        </div>
      )}

      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && validateFile(file)) {
            setFiles(prev => ({ ...prev, [type]: file }));
          }
        }}
      />
    </label>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">
        My Number Identity Verification
      </h2>

      {/* Grid - mobile responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderDropBox('front', 'Front Side of Card')}
        {renderDropBox('back', 'Back Side of Card')}
        {renderDropBox('selfie', 'Selfie with Card')}
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Submit Verification
      </button>
    </div>
  );
}
