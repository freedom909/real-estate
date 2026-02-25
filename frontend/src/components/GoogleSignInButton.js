"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GoogleSignInButton() {
  const buttonRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log("🟢 Google ID Token:", response.credential);

        const result = await signIn("credentials", {
          redirect: false,
          provider: "GOOGLE",
          idToken: response.credential,
        });

        console.log("🟢 signIn result:", result);

        if (result?.ok) {
          router.push("/");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 300,
    });
  }, [router]);

  return <div ref={buttonRef} />;
}
