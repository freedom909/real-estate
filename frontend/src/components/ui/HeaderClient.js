// components/HeaderClient.js
"use client";
import React from "react";
import { useSession } from "next-auth/react";
import JoinNowButton from "@/components/ui/JoinNowButton";
import ProfileMenu from "@/components/ui/ProfilesMenu";

export default function HeaderClient() {
  const { data: session } = useSession();
  const isLogin = !!session?.user;
  const user = session?.user;

  return (
    <div className="flex space-x-4">
      <a href="#" className="underline">Get the Minshuku App</a>

      {isLogin ? (
        <ProfileMenu user={user} />
      ) : (
        <JoinNowButton>Join Now</JoinNowButton>
      )}
    </div>
  );
}
