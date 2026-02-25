// app/api/verify-mynumber/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const body = await req.json();

  const { data } = await axios.post(
    process.env.BACKEND_MYNUNBER_VERIFY_URL,
    body
  );

  return NextResponse.json(data);
}
