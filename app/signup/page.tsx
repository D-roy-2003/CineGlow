'use client'
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import ShinyText from '../../components/ShinyText';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const passwordChecks = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'One special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const pwInputRef = useRef<HTMLInputElement>(null);
  const { setUser } = useAuth();
  const router = useRouter();

  const checks = passwordChecks.map(c => c.test(password));
  const allValid = checks.every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!allValid) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    // REAL API CALL
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      setUser({ name: data.user.name, email: data.user.email });
      localStorage.setItem('cineglow_user', JSON.stringify({ name: data.user.name, email: data.user.email, token: data.token }));
      router.push('/');
    } catch (err) {
      setError('Network error');
    }
  };

  // Show requirements if focused or has value
  const showPwReqs = pwFocused || password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80 relative" style={{ backgroundImage: 'url(/loginbg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Make overlay lighter */}
      <div className="absolute inset-0 bg-black/40" />
      {/* CineGlow logo and text top left */}
      <motion.a
        href="/"
        className="fixed top-6 left-6 z-20 flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <Zap className="w-7 h-7 text-white drop-shadow-lg" />
            </motion.div>
          </div>
          <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse" />
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl opacity-30 blur-lg"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        </div>
        <ShinyText
          text="CineGlow"
          speed={6}
          className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent ml-2"
        />
      </motion.a>
      <div className="relative z-10 w-full max-w-md mx-auto p-8 rounded-2xl bg-black/80 shadow-2xl flex flex-col items-center">
        <div className="flex w-full mb-8">
          <Link href="/login" className="flex-1 text-2xl font-bold text-violet-300 pb-2 text-center hover:text-white transition-colors">Sign In</Link>
          <button className="flex-1 text-2xl font-bold text-white border-b-2 border-violet-400 pb-2">Sign Up</button>
        </div>
        <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-white text-sm">Username</label>
            <input id="username" type="text" autoComplete="username" className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white text-sm">Email</label>
            <input id="email" type="email" autoComplete="email" className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white text-sm">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              ref={pwInputRef}
              required
            />
            {/* Password requirements: only show if focused or has value */}
            {showPwReqs && (
              <ul className="text-xs mt-2">
                {passwordChecks.map((c, i) => (
                  <li
                    key={c.label}
                    className={
                      password.length === 0
                        ? 'text-white flex items-center gap-1'
                        : checks[i]
                        ? 'text-green-400 flex items-center gap-1'
                        : 'text-red-400 flex items-center gap-1'
                    }
                  >
                    {password.length === 0 ? '' : checks[i] ? '✓' : '✗'} {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-white text-sm">Confirm Password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input id="agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-violet-500 w-4 h-4" required />
            <label htmlFor="agree" className="text-white text-xs">I agree to the <a href="#" className="underline text-violet-300">Terms of Service</a> and <a href="#" className="underline text-violet-300">Privacy Policy</a></label>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-semibold text-lg mt-2">Create Account</button>
        </form>
      </div>
    </div>
  );
} 