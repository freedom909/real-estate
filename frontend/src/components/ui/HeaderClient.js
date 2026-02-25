// components/HeaderClient.js
"use client";
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import JoinNowButton from "@/components/ui/JoinNowButton";
import ProfileMenu from "@/components/ui/ProfilesMenu";

export default function HeaderClient() {
  const { data: session } = useSession();
  const isLogin = !!session?.user;
  const user = session?.user;

  return (
    <div className="flex space-x-4">
      <a href="#" className="underline">Get the Minshuku App</a>
      <Link href="/cart" className="px-3 py-2 rounded bg-blue-800 hover:bg-blue-700 text-white">🛒 Cart</Link>

      {isLogin ? (
        <ProfileMenu user={user} />
      ) : (
        <JoinNowButton>Join Now</JoinNowButton>
      )}
    </div>
  );
}
