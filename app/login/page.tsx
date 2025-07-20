'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import ShinyText from '../../components/ShinyText';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // TODO: Call backend API for login
    // Simulate login for now
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    // Replace with real API call
    setUser({ email });
    localStorage.setItem('cineglow_user', JSON.stringify({ email }));
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80 relative" style={{ backgroundImage: 'url(/loginbg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Make overlay lighter to match signup */}
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
          <button className="flex-1 text-2xl font-bold text-white border-b-2 border-violet-400 pb-2">Sign In</button>
          <Link href="/signup" className="flex-1 text-2xl font-bold text-violet-300 pb-2 text-center hover:text-white transition-colors">Sign Up</Link>
        </div>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white text-sm">Email</label>
            <input id="email" type="email" autoComplete="email" className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white text-sm">Password</label>
            <input id="password" type="password" autoComplete="current-password" className="w-full px-4 py-3 rounded-lg bg-black/60 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-semibold text-lg mt-2">Sign In</button>
        </form>
        <div className="w-full flex flex-col items-center mt-4">
          <Link href="#" className="text-violet-300 hover:text-white text-sm mb-2">Forgot password?</Link>
          <span className="text-white text-sm">New to CineGlow? <Link href="/signup" className="text-violet-300 hover:text-white font-semibold">Sign up now</Link></span>
        </div>
      </div>
    </div>
  );
} 