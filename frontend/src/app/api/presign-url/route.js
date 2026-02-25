import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import axios from "axios";

export async function POST(req) {
  const session = await getServerSession(authOptions);
 
      if (!session?.accessToken) {
    console.error("❌ No accessToken in session");
    return new Response("Unauthorized", { status: 401 });
  }
console.log("✅ Sending token to backend:", session.accessToken.slice(0, 30));
   const response = await axios.post(
    process.env.INTERNAL_API_URI,
    {
      query: `
        mutation PresignUrl {
          presignUploadUrl
        }
      `,
    },
  {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // 🔥 核心
      },
    }
  );
  return Response.json(response.data);
  }
  

