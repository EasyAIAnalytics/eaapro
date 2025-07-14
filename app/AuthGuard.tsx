"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/supabaseAuth";
import React, { createContext, useContext } from "react";

const AuthOnceContext = createContext<{ hasAuthedOnce: boolean; setHasAuthedOnce: (v: boolean) => void }>({ hasAuthedOnce: false, setHasAuthedOnce: () => {} });

export function AuthOnceProvider({ children }: { children: React.ReactNode }) {
  // Use sessionStorage to persist hasAuthedOnce
  const [hasAuthedOnce, setHasAuthedOnceState] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasAuthedOnceState(sessionStorage.getItem('hasAuthedOnce') === 'true');
    }
  }, []);
  const setHasAuthedOnce = (v: boolean) => {
    setHasAuthedOnceState(v);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasAuthedOnce', v ? 'true' : 'false');
    }
  };
  return (
    <AuthOnceContext.Provider value={{ hasAuthedOnce, setHasAuthedOnce }}>
      {children}
    </AuthOnceContext.Provider>
  );
}

export function useAuthOnce() {
  return useContext(AuthOnceContext);
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasAuthedOnce, setHasAuthedOnce } = useAuthOnce();
  const [checked, setChecked] = useState(hasAuthedOnce);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJustLoggedIn(sessionStorage.getItem('justLoggedIn') === 'true');
    }
  }, []);

  useEffect(() => {
    if (hasAuthedOnce && !justLoggedIn) {
      setChecked(true);
      return;
    }
    if (pathname === "/login" || pathname === "/signup") {
      setChecked(true);
      return;
    }
    let timeoutId: NodeJS.Timeout;
    let authDone = false;
    let timerDone = false;
    const finish = () => {
      if (authDone && timerDone) {
        setChecked(true);
        setHasAuthedOnce(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('justLoggedIn', 'false');
        }
      }
    };
    getCurrentUser().then(({ data }) => {
      if (!data?.user) {
        router.replace("/login");
        return;
      }
      authDone = true;
      finish();
    });
    timeoutId = setTimeout(() => {
      timerDone = true;
      finish();
    }, justLoggedIn ? 2000 : 0);
    return () => clearTimeout(timeoutId);
  }, [pathname, router, hasAuthedOnce, setHasAuthedOnce, justLoggedIn]);

  if (!checked && justLoggedIn) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', zIndex: 9999 }}>
      <div className="loader" style={{ margin: '0 auto' }}>
        <div className="box box0"><div></div></div>
        <div className="box box1"><div></div></div>
        <div className="box box2"><div></div></div>
        <div className="box box3"><div></div></div>
        <div className="box box4"><div></div></div>
        <div className="box box5"><div></div></div>
        <div className="box box6"><div></div></div>
        <div className="box box7"><div></div></div>
        <div className="ground"><div></div></div>
      </div>
      <svg className="loader-spinner" viewBox="25 25 50 50"><circle className="loader-spinner" r="20" cy="50" cx="50"></circle></svg>
    </div>
  );
  if (!checked) return null;
  return <>{children}</>;
} 