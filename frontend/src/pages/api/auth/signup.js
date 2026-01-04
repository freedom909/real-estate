// frontend/src/pages/api/auth/signup.js
import localAuthService from "../../../userService/localAuthService";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  
    try {
      const { email, password, name, nickname, role, picture, inviteCode } = req.body;
  
      console.log("Signup payload:", req.body); // ✅ Confirm this logs properly
  
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Required fields missing' });
      }
  
      const user = await localAuthService.register({
        email,
        password,
        name,
        nickname,
        role,
        picture,
        inviteCode: inviteCode || "",
      });
  
      return res.status(200).json({ success: true, user});
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  