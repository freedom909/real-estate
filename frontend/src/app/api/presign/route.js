import { NextResponse } from "next/server";
import crypto from "crypto";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GCP_BUCKET_NAME;

export async function POST(req) {
  try {
    const { filename, type } = await req.json();

    if (!filename || !type) {
      return NextResponse.json(
        { error: "filename and type required" },
        { status: 400 }
      );
    }

    // file path: mynumber/<random>-filename.jpg
    const key = `mynumber/${crypto.randomUUID()}-${filename}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(key);

    // Create signed PUT URL for uploading
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType: type,
    });

    return NextResponse.json({
      filePath: key,
      uploadUrl,
    });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Presign failed", details: err.message },
      { status: 500 }
    );
  }
}
