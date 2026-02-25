// pages/api/upload.js
import fs from "fs";
import path from "path";
import formidable from "formidable";

// IMPORTANT: disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "/public/uploads");

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    multiples: false,
  });

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
        return resolve();
      }

      const file = files.file;

      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return resolve();
      }

      const fileName = path.basename(file.filepath);
      const fileUrl = "/uploads/" + fileName;

      return resolve(
        res.status(200).json({
          success: true,
          fileUrl,
          originalName: file.originalFilename,
        })
      );
    });
  });
}
