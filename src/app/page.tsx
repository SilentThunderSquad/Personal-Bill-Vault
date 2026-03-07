'use client';

import Link from 'next/link';HeroUI for the "Premium Look" and TanStack Query for the "Smooth Feel."
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import {
  Shield, Bell, Camera, Search, Lock, ChevronRight, CheckCircle2,
  Sparkles, Receipt, FolderOpen, ArrowRight, Zap, Star,
  FileCheck, ScanLine, MailCheck, ShieldCheck, TrendingUp, Clock,
} from 'lucide-react';

/* ─── Framer Motion ─── */
const ease: Easing = [0.25, 0.4, 0.25, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease } }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.5, ease } }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

/* ─── Feature Card Component ─── */
function FeatureCard({ icon: Icon, title, desc, gradient, glow, iconBg, iconColor }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string; desc: string; gradient: string; glow: string; iconBg: string; iconColor: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-8 cursor-default transition-all duration-500 hover:-translate-y-1.5"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,0,0,0.4), 0 0 40px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: gradient }}
      />
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
        style={{ background: iconBg }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <h3 className="text-lg font-bold mb-2.5 text-white">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{desc}</p>
    </div>
  );
}

/* ─── Problem Card Component ─── */
function ProblemCard({ icon: Icon, title, desc, color, hoverBg }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string; desc: string; color: string; hoverBg: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-8 cursor-default transition-all duration-500 hover:-translate-y-1"
      style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color + '40';
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
      }}
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: color + '18' }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{desc}</p>
    </div>
  );
}

/* ─── Dashboard Mockup ─── */
function DashboardMockup() {
  const stats = [
    { label: 'TOTAL BILLS', value: '24', icon: Receipt, iconColor: '#60A5FA', bg: 'rgba(59,130,246,0.1)' },
    { label: 'ACTIVE', value: '18', icon: ShieldCheck, iconColor: '#4ADE80', bg: 'rgba(34,197,94,0.1)' },
    { label: 'EXPIRING', value: '3', icon: Clock, iconColor: '#FBBF24', bg: 'rgba(245,158,11,0.1)' },
    { label: 'EXPIRED', value: '3', icon: TrendingUp, iconColor: '#FB7185', bg: 'rgba(244,63,94,0.1)' },
  ];
  const bills = [
    { name: 'MacBook Pro 16"', store: 'Apple Store', amount: '₹2,49,900', date: '2026-08-15', status: 'Active', dot: '#22C55E' },
    { name: 'Samsung Washing Machine', store: 'Amazon', amount: '₹34,990', date: '2026-03-02', status: 'Expiring', dot: '#FBBF24' },
    { name: 'Sony WH-1000XM5', store: 'Croma', amount: '₹24,990', date: '2027-01-20', status: 'Active', dot: '#22C55E' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 sm:mt-20">
      {/* Glow */}
      <div className="absolute -inset-6 rounded-3xl blur-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.1), rgba(212,165,116,0.12))' }}
      />
      {/* Card */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 80px rgba(59,130,246,0.12), 0 40px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-5 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,7,18,0.5)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#EAB308' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md text-xs flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}
            >
              <Lock className="w-3 h-3" /> warrantyvault.app/dashboard
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl p-3 sm:p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] tracking-wider font-medium" style={{ color: '#64748B' }}>{s.label}</span>
                  <div className="p-1 sm:p-1.5 rounded-lg" style={{ background: s.bg }}>
                    <s.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: s.iconColor }} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
          {/* Bills */}
          <div className="space-y-2">
            {bills.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: b.dot }} />
                  <div>
                    <div className="text-sm font-medium text-white">{b.name}</div>
                    <div className="text-xs" style={{ color: '#64748B' }}>{b.store}</div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{b.amount}</div>
                  <div className="text-xs" style={{ color: '#64748B' }}>Exp: {b.date}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium hidden md:inline-block"
                  style={{ background: b.dot + '20', color: b.dot }}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 rounded-b-2xl"
        style={{ background: 'linear-gradient(to top, #030712, transparent)' }}
      />
    </div>
  );
}

/* ─── Floating Icon ─── */
function FloatingIcon({ icon: Icon, color, className }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string; className: string;
}) {
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <div className="p-3.5 rounded-2xl"
        style={{
          background: color + '15',
          border: `1px solid ${color}30`,
          boxShadow: `0 8px 30px ${color}15`,
        }}
      >
        <Icon className="w-6 h-6" style={{ color: color + 'AA' }} />
      </div>
    </div>
  );
}

/* ─── Section Divider ─── */
function Divider() {
  return (
    <div className="max-w-4xl mx-auto" style={{
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(212,165,116,0.3), transparent)',
    }} />
  );
}

/* ═══════════════════════════════════════════════ */
/*  LANDING PAGE                                  */
/* ═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030712 0%, #060D1F 30%, #050A18 60%, #030712 100%)' }}
    >

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50"
        style={{
          background: 'rgba(3,7,18,0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Shield className="w-7 h-7 transition-transform group-hover:scale-110" style={{ color: '#3B82F6' }} />
            <span className="text-xl font-bold tracking-tight">
              <span style={{ color: '#3B82F6' }}>Warranty</span>
              <span style={{ color: '#D4A574' }}>Vault</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#94A3B8' }}
              >
                Sign In
              </Link>
              <Link href="/sign-up"
                className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-glow"
                style={{ background: '#3B82F6' }}
              >
                Get Started Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard"
                className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-glow flex items-center gap-2"
                style={{ background: '#3B82F6' }}
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* BG orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full"
            style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '90vw', height: '50vh', background: 'rgba(59,130,246,0.12)', filter: 'blur(120px)' }}
          />
          <div className="absolute rounded-full"
            style={{ top: '20%', left: '-10%', width: '40vw', height: '40vw', background: 'rgba(139,92,246,0.08)', filter: 'blur(100px)' }}
          />
          <div className="absolute rounded-full"
            style={{ top: '30%', right: '-5%', width: '35vw', height: '35vw', background: 'rgba(212,165,116,0.06)', filter: 'blur(100px)' }}
          />
          {/* Grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        {/* Floating icons */}
        <FloatingIcon icon={Receipt} color="#3B82F6" className="top-1/4 left-[8%] animate-float" />
        <FloatingIcon icon={Bell} color="#F59E0B" className="top-1/3 right-[10%] animate-float-d1" />
        <FloatingIcon icon={ShieldCheck} color="#22C55E" className="bottom-1/4 left-[5%] animate-float-d2" />
        <FloatingIcon icon={Camera} color="#A855F7" className="bottom-1/3 right-[12%] animate-float-d3" />

        <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={stagger} 
            className="flex flex-col items-center text-center gap-8 mb-16 sm:mb-24"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-xs sm:text-sm font-medium tracking-wide text-accent">
                  Your Digital Warranty Organizer
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} custom={1} className="max-w-4xl">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-[1.1] tracking-tight text-white">
                Never Lose a <span className="gradient-text">Bill</span> or <span className="gradient-text">Warranty</span> <span className="block text-text-muted/60 text-2xl sm:text-4xl mt-4">Ever Again</span>
              </h1>
            </motion.div>

            {/* Sub text */}
            <motion.p variants={fadeUp} custom={2}
              className="max-w-2xl text-lg sm:text-xl text-text-muted leading-relaxed"
            >
              Store all your purchase bills &amp; warranty cards in one secure vault.
              We&apos;ll remind you before they expire — so you never miss a claim.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 items-center pt-2">
              <SignedOut>
                <Link href="/sign-up"
                  className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all btn-glow"
                >
                  Create Your Free Vault
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl text-lg font-medium border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all"
                >
                  I Already Have an Account
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard"
                  className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all btn-glow"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-text-muted/60">
              {['Free forever', 'No credit card', 'Secure & private'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success/70" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6, duration: 0.8, ease }}
            className="w-full max-w-5xl"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #030712, transparent)' }}
        />
      </section>

      <Divider />

      {/* ═══ PROBLEM ═══ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.3 }} 
            variants={stagger} 
            className="text-center mb-16 sm:mb-20"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold uppercase tracking-[0.2em] text-danger mb-4">
              The Pain
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-black mb-6 text-white leading-tight">
              Sound <span className="gradient-text-gold">Familiar</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-text-muted max-w-2xl mx-auto">
              Warranties always seem to expire exactly one week before the product breaks. 
              Don't let disorganized paperwork cost you thousands.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.2 }} 
            variants={stagger} 
            className="grid md:grid-cols-3 gap-6 sm:gap-8"
          >
            <motion.div variants={scaleIn} custom={0}>
              <ProblemCard 
                icon={FolderOpen} 
                title="Bills everywhere"
                desc="Paper in drawers, PDFs in emails, photos on WhatsApp. Finding the right one when you need it is a nightmare."
                color="#EF4444" 
                hoverBg="rgba(239,68,68,0.06)"
              />
            </motion.div>
            <motion.div variants={scaleIn} custom={1}>
              <ProblemCard 
                icon={Clock} 
                title="Missed deadlines"
                desc="Your appliance broke but the warranty expired last week. You had no reminder and now you're stuck with the bill."
                color="#F59E0B" 
                hoverBg="rgba(245,158,11,0.06)"
              />
            </motion.div>
            <motion.div variants={scaleIn} custom={2}>
              <ProblemCard 
                icon={Receipt} 
                title="Hours of searching"
                desc="The service center is waiting and you're digging through old cloud folders. It's time to digitize your peace of mind."
                color="#A855F7" 
                hoverBg="rgba(168,85,247,0.06)"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ═══ FEATURES ═══ */}
      <section className="px-4 sm:px-6 lg:px-8 relative" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        {/* BG glow */}
        <div className="absolute pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', background: 'rgba(59,130,246,0.04)', borderRadius: '50%', filter: 'blur(180px)' }}
        />

        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase mb-4"
              style={{ color: '#D4A574', letterSpacing: '0.2em' }}
            >
              The Solution
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-bold mb-5 text-white">
              One <span className="gradient-text">Vault</span> for Everything
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
              Everything you need to organize, protect, and never forget about your purchases.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ScanLine, title: 'Smart OCR Scanning', desc: 'Take a photo of any bill — our AI reads and fills in product name, price, date, and store automatically.', gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)', glow: 'rgba(59,130,246,0.12)', iconBg: 'rgba(59,130,246,0.12)', iconColor: '#60A5FA' },
              { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'Encrypted storage with row-level security. Only you can access your data — no exceptions, ever.', gradient: 'linear-gradient(135deg, #22C55E, #10B981)', glow: 'rgba(34,197,94,0.1)', iconBg: 'rgba(34,197,94,0.12)', iconColor: '#4ADE80' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Email notifications before warranties expire. You set the timing — 7, 14, 30, or 90 days ahead.', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', glow: 'rgba(245,158,11,0.1)', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#FBBF24' },
              { icon: Search, title: 'Instant Search', desc: 'Find any bill in seconds. Filter by product, brand, store, category, or warranty status.', gradient: 'linear-gradient(135deg, #A855F7, #EC4899)', glow: 'rgba(168,85,247,0.1)', iconBg: 'rgba(168,85,247,0.12)', iconColor: '#C084FC' },
              { icon: Lock, title: 'Always Private', desc: 'Powered by Clerk authentication and Supabase RLS. Your warranty data stays exclusively yours.', gradient: 'linear-gradient(135deg, #F43F5E, #E11D48)', glow: 'rgba(244,63,94,0.1)', iconBg: 'rgba(244,63,94,0.12)', iconColor: '#FB7185' },
              { icon: Sparkles, title: 'Free Forever', desc: 'No subscriptions, no hidden fees. Warranty Vault is completely free for everyone — forever.', gradient: 'linear-gradient(135deg, #0EA5E9, #3B82F6)', glow: 'rgba(14,165,233,0.1)', iconBg: 'rgba(14,165,233,0.12)', iconColor: '#38BDF8' },
            ].map((f, i) => (
              <motion.div key={f.title} variants={scaleIn} custom={i}>
                <FeatureCard {...f} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="max-w-5xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center mb-20">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase mb-4"
              style={{ color: '#3B82F6', letterSpacing: '0.2em' }}
            >
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-bold text-white">
              Three Steps to <span className="gradient-text">Peace of Mind</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid md:grid-cols-3 gap-12 relative"
          >
            {[
              { num: '01', title: 'Upload Your Bill', desc: 'Snap a photo or upload an image. Our OCR engine extracts all the details in seconds.', icon: Camera },
              { num: '02', title: 'We Organize Everything', desc: 'Bills are categorized, warranty dates tracked, and everything is searchable instantly.', icon: FileCheck },
              { num: '03', title: 'Get Timely Alerts', desc: 'Receive smart email reminders before any warranty expires. Never miss a claim again.', icon: MailCheck },
            ].map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i} className="relative text-center">
                {/* Connector */}
                {i < 2 && (
                  <div className="hidden md:block absolute"
                    style={{
                      top: '1.75rem', left: 'calc(50% + 2.5rem)', right: 'calc(-50% + 2.5rem)',
                      height: '2px',
                      background: 'linear-gradient(90deg, rgba(59,130,246,0.4), rgba(212,165,116,0.2))',
                    }}
                  />
                )}
                {/* Number */}
                <div className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-extrabold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #A78BFA)',
                    boxShadow: '0 0 30px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.1)',
                  }}
                >
                  {step.num}
                </div>
                {/* Icon */}
                <div className="inline-flex p-5 rounded-2xl mb-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <step.icon className="w-8 h-8" style={{ color: '#D4A574' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#94A3B8' }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ═══ STATS ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="relative rounded-3xl overflow-hidden">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-3xl p-px"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.25), rgba(212,165,116,0.35))' }}
            >
              <div className="w-full h-full rounded-3xl" style={{ background: '#030712' }} />
            </div>
            <div className="relative rounded-3xl p-10 sm:p-14"
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '100%', label: 'Free Forever', icon: Zap, color: '#FBBF24' },
                  { value: '256-bit', label: 'Encryption', icon: Lock, color: '#4ADE80' },
                  { value: '<2min', label: 'To Add a Bill', icon: Camera, color: '#60A5FA' },
                  { value: '∞', label: 'Bills Stored', icon: Star, color: '#C084FC' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} variants={scaleIn} custom={i + 1}>
                    <stat.icon className="w-6 h-6 mx-auto mb-3" style={{ color: stat.color }} />
                    <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1.5">{stat.value}</div>
                    <div className="text-sm" style={{ color: '#94A3B8' }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ AUDIENCE ═══ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Built for People Who Value<br />
              <span className="gradient-text-gold">Their Peace of Mind</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg mb-10" style={{ color: '#94A3B8' }}>
              Whether you&apos;re managing a household or running a business — we&apos;ve got you covered.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Busy Families', emoji: '👨‍👩‍👧‍👦' },
                { label: 'Working Professionals', emoji: '💼' },
                { label: 'Shop Owners', emoji: '🏪' },
                { label: 'Gadget Enthusiasts', emoji: '📱' },
                { label: 'Home Makers', emoji: '🏠' },
                { label: 'Students', emoji: '🎓' },
              ].map((a) => (
                <span key={a.label} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm text-white cursor-default transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)'; e.currentTarget.style.background = 'rgba(212,165,116,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <span>{a.emoji}</span> {a.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-4 sm:px-6 lg:px-8 relative" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'rgba(59,130,246,0.08)', filter: 'blur(150px)' }}
          />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
                style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)' }}
              >
                <Zap className="w-4 h-4" style={{ color: '#3B82F6' }} />
                <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>Start in 30 seconds</span>
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-bold mb-5 text-white">
              Start Protecting Your<br />Purchases <span className="gradient-text-gold">Today</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg mb-10" style={{ color: '#94A3B8' }}>
              Join Warranty Vault and never worry about losing a bill or missing a warranty window.
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <SignedOut>
                <Link href="/sign-up"
                  className="group inline-flex items-center gap-2.5 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all btn-primary"
                >
                  Create Your Free Account
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard"
                  className="group inline-flex items-center gap-2.5 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all btn-primary"
                >
                  Open Your Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </SignedIn>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5" style={{ color: '#3B82F6' }} />
            <span className="font-bold tracking-tight">
              <span style={{ color: '#3B82F6' }}>Warranty</span>
              <span style={{ color: '#D4A574' }}>Vault</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
            © {new Date().getFullYear()} Warranty Vault. Your bills are safe with us.
          </p>
        </div>
      </footer>
    </div>
  );
}
