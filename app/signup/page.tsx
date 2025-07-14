"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/config";
import { useRouter } from "next/navigation";
import LoginBackground from "../login/LoginBackground";
import "../login/login-form.css";
import { supabase } from '@/lib/config';
import { FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

// AnimatedLogoDots from home page
const SHAPES = [
  [ { x: 8, y: 32 }, { x: 16, y: 26 }, { x: 20, y: 20 }, { x: 28, y: 14 }, { x: 34, y: 8 } ],
  [ { x: 8, y: 32 }, { x: 16, y: 24 }, { x: 20, y: 12 }, { x: 28, y: 20 }, { x: 34, y: 28 } ],
  Array.from({ length: 5 }).map((_, i) => {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    return { x: 20 + 10 * Math.cos(angle), y: 20 + 10 * Math.sin(angle) };
  }),
  Array.from({ length: 5 }).map((_, i) => {
    const t = i / 4 * 2 * Math.PI;
    const r = 4 + 2.5 * i;
    return { x: 20 + r * Math.cos(t - Math.PI / 2), y: 20 + r * Math.sin(t - Math.PI / 2) };
  }),
  [ { x: 8, y: 20 }, { x: 16, y: 14 }, { x: 20, y: 20 }, { x: 28, y: 26 }, { x: 34, y: 20 } ],
];
const ANIMATION_DURATION = 1200;
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function interpolateShape(
  from: { x: number; y: number }[],
  to: { x: number; y: number }[],
  t: number
): { x: number; y: number }[] {
  return from.map((pt, i) => ({ x: lerp(pt.x, to[i].x, t), y: lerp(pt.y, to[i].y, t) }));
}
const AnimatedLogoDots = () => {
  const [shapeIdx, setShapeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const lastTimestamp = useRef<number | null>(null);
  useEffect(() => {
    function animate(ts: number) {
      if (lastTimestamp.current === null) lastTimestamp.current = ts;
      const elapsed = lastTimestamp.current !== null ? ts - lastTimestamp.current : 0;
      let t = Math.min(elapsed / ANIMATION_DURATION, 1);
      setProgress(t);
      if (t < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setShapeIdx((idx) => (idx + 1) % SHAPES.length);
          setProgress(0);
          lastTimestamp.current = null;
          requestRef.current = requestAnimationFrame(animate);
        }, 400);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [shapeIdx]);
  const from = SHAPES[shapeIdx];
  const to = SHAPES[(shapeIdx + 1) % SHAPES.length];
  const dots = interpolateShape(from, to, progress);
  return (
    <svg className="w-12 h-12 text-white" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {dots.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={2.2} fill="#fff" style={{ filter: 'drop-shadow(0 1px 4px #60a5fa88)' }} />
      ))}
    </svg>
  );
};

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [showConfirmMsg, setShowConfirmMsg] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Use Supabase signup
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message && error.message.toLowerCase().includes('password')) {
          setError('Password must be at least 6 characters and include a letter and number.');
        } else {
          setError(error.message || 'Signup failed');
        }
        setLoading(false);
        return;
      }
      setShowConfirmMsg(true);
      setLoading(false);
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) setError(error.message || 'Resend failed');
    } catch (err) {
      setError('Resend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ overflow: 'hidden' }}>
      <LoginBackground />
      <div className="form relative z-10 mx-auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header with logo and project name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg flex items-center justify-center mb-2">
            <AnimatedLogoDots />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Easy AI Analytics
          </h1>
        </div>
        <form className="form w-full" onSubmit={handleSignup} autoComplete="on">
          <div className="flex-column">
            <label>Email</label>
          </div>
          <div className="inputForm">
            <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path></g></svg>
            <input type="email" className="input" placeholder="Enter your Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="flex-column">
            <label>Username</label>
          </div>
          <div className="inputForm">
            <FiUser size={20} style={{ marginRight: 6, color: '#1d4ed8' }} />
            <input type="text" className="input" placeholder="Enter your Username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="flex-column">
            <label>Password</label>
          </div>
          <div className="inputForm">
            <input type={showPassword ? "text" : "password"} className="input" placeholder="Enter your Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" style={{ background: 'none', border: 'none', marginLeft: 6, cursor: 'pointer' }} onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="flex-column">
            <label>Confirm Password</label>
          </div>
          <div className="inputForm">
            <input type={showConfirmPassword ? "text" : "password"} className="input" placeholder="Confirm your Password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            <button type="button" style={{ background: 'none', border: 'none', marginLeft: 6, cursor: 'pointer' }} onClick={() => setShowConfirmPassword(v => !v)}>
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <button className="btn-primary btn-sm w-full mt-4" type="submit" disabled={loading}>
            <span className="button_top flex items-center justify-center">
              {loading ? "Signing up..." : "Sign Up"}
            </span>
          </button>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 mb-2 text-center">{error}</div>}
          {showConfirmMsg && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded p-2 mb-2 text-center">
              A confirmation link has been sent to your email. Please confirm your account before logging in.<br />
              <button className="btn-primary btn-sm mt-2" style={{ minWidth: 120, fontSize: 13, padding: '0.4em 1em', color: '#fff' }} type="button" onClick={handleResend} disabled={loading}>
                Resend confirmation email
              </button>
            </div>
          )}
          <p className="p">Already have an account? <span className="span" onClick={() => router.push('/login')}>Sign In</span></p>
          <p className="p line">Or With</p>
          <div className="flex flex-col items-center gap-3 w-full mt-2" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <button className="signin w-full max-w-xs mx-auto" type="button" onClick={() => setError('Google signup not implemented')}>
              <svg viewBox="0 0 256 262" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></svg>
              Sign in with Google
            </button>
            <button className="signin w-full max-w-xs mx-auto" type="button" onClick={() => setError('GitHub signup not implemented')}>
              <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0.297C5.373 0.297 0 5.67 0 12.297c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.046.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .321.218.694.825.576C20.565 22.092 24 17.594 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              Sign in with GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 