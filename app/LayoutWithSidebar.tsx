"use client";
import { usePathname } from "next/navigation";
import LayoutWrapper from '@/components/LayoutWrapper';

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }
  return <LayoutWrapper>{children}</LayoutWrapper>;
} 