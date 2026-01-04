// src/pages/api/oauth/google.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  
    // Handle OAuth login logic here
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }
  
    // Example response
    return res.status(200).json({ success: true, token });
  }
  