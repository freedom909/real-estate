//frontend/src/components/IdentityUpload.jsx

import { useState } from "react";

export default function IdentityUpload() {
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const handleUpload = (event, setState) => {
    const file = event.target.files[0];
    if (!file) return;
    setState(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 p-4">
      <h1 className="text-xl font-bold text-center">本人確認書類のアップロード</h1>

      {/* Front */}
      <div>
        <p className="font-medium mb-2">マイナンバーカード（表面）</p>
        <label className="block p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          {front ? (
            <img src={front} className="w-full rounded" />
          ) : (
            <p className="text-gray-500 text-center">クリックしてアップロード</p>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleUpload(e, setFront)}
          />
        </label>
      </div>

      {/* Back */}
      <div>
        <p className="font-medium mb-2">マイナンバーカード（裏面）</p>
        <label className="block p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          {back ? (
            <img src={back} className="w-full rounded" />
          ) : (
            <p className="text-gray-500 text-center">クリックしてアップロード</p>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleUpload(e, setBack)}
          />
        </label>
      </div>

      {/* Selfie */}
      <div>
        <p className="font-medium mb-2">顔写真（セルフィー）</p>
        <label className="block p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          {selfie ? (
            <img src={selfie} className="w-full rounded" />
          ) : (
            <p className="text-gray-500 text-center">クリックしてアップロード</p>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleUpload(e, setSelfie)}
          />
        </label>
      </div>
    </div>
  );
}
