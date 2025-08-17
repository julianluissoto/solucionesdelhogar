"use client";

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import SplashScreen from "./splash-screen";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [loading, setLoading] = useState(isHomePage);

  useEffect(() => {
    if (isHomePage) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHomePage]);

  return (
    <>
      {loading && isHomePage ? (
        <SplashScreen />
      ) : (
        <AuthProvider>
            <div className="container mx-auto">
              {children}
            </div>
            <Toaster />
        </AuthProvider>
      )}
    </>
  );
}
