// src/pages/api/login.js

import localAuthService from "@/userService/localAuthService";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {email, password } = req.body;

    try {
      const result = await localAuthService.login(email, password, res);
      res.status(200).json({success: true, user: result.user });
    } catch (err) {
      res.status(401).json({success: false, message: err.message });
    }
  } else {
    res.status(405).end();
  }
}
