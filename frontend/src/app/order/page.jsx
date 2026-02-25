"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderAliasPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/orders");
  }, [router]);
  return (
    <div className="p-6">
      <p>Redirecting to Orders...</p>
      <a href="/orders" className="text-blue-600">Go to Orders</a>
    </div>
  );
}