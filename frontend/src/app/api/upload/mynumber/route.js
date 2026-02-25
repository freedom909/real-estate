// app/api/upload/mynumber/route.js
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

export async function POST(req) {
  const { fileName, contentType } = await req.json();
  const bucketName = "minshuku-bucket";
  const folder = "mynumber";

  const newPath = `${folder}/${Date.now()}-${fileName}`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(newPath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000,
    contentType,
  });

  return NextResponse.json({
    uploadUrl: url,
    filePath: newPath,
  });
}
