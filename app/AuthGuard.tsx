"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") {
      setChecked(true);
      return;
    }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
    }
    setChecked(true);
  }, [pathname, router]);
  if (!checked) return null;
  return <>{children}</>;
} 