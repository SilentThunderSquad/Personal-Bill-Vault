'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import {
  Shield,
  Bell,
  Camera,
  Search,
  Lock,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Receipt,
  FolderOpen,
  ArrowRight,
  Zap,
  Star,
  FileCheck,
  ScanLine,
  MailCheck,
  ShieldCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';

/* ─── Animation Variants ─── */
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

/* ─── Data ─── */
const FEATURES = [
  {
    icon: ScanLine, title: 'Smart OCR Scanning',
    desc: 'Take a photo of any bill — our AI reads and fills in product name, price, date, and store automatically.',
    gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)', glow: 'rgba(59, 130, 246, 0.15)', iconBg: 'rgba(59, 130, 246, 0.12)', iconColor: '#60A5FA',
  },
  {
    icon: ShieldCheck, title: 'Bank-Grade Security',
    desc: 'Encrypted storage with row-level security. Only you can access your data — no exceptions, ever.',
    gradient: 'linear-gradient(135deg, #22C55E, #10B981)', glow: 'rgba(34, 197, 94, 0.12)', iconBg: 'rgba(34, 197, 94, 0.12)', iconColor: '#4ADE80',
  },
  {
    icon: Bell, title: 'Smart Reminders',
    desc: 'Email notifications before warranties expire. You set the timing — 7, 14, 30, or 90 days ahead.',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', glow: 'rgba(245, 158, 11, 0.12)', iconBg: 'rgba(245, 158, 11, 0.12)', iconColor: '#FBBF24',
  },
  {
    icon: Search, title: 'Instant Search',
    desc: 'Find any bill in seconds. Filter by product, brand, store, category, or warranty status.',
    gradient: 'linear-gradient(135deg, #A855F7, #EC4899)', glow: 'rgba(168, 85, 247, 0.12)', iconBg: 'rgba(168, 85, 247, 0.12)', iconColor: '#C084FC',
  },
  {
    icon: Lock, title: 'Always Private',
    desc: 'Powered by Clerk authentication and Supabase RLS. Your warranty data stays exclusively yours.',
    gradient: 'linear-gradient(135deg, #F43F5E, #E11D48)', glow: 'rgba(244, 63, 94, 0.12)', iconBg: 'rgba(244, 63, 94, 0.12)', iconColor: '#FB7185',
  },
  {
    icon: Sparkles, title: 'Free Forever',
    desc: 'No subscriptions, no hidden fees. Warranty Vault is completely free for everyone — forever.',
    gradient: 'linear-gradient(135deg, #0EA5E9, #3B82F6)', glow: 'rgba(14, 165, 233, 0.12)', iconBg: 'rgba(14, 165, 233, 0.12)', iconColor: '#38BDF8',
  },
];

const STEPS = [
  { num: '01', title: 'Upload Your Bill', desc: 'Snap a photo or upload an image. Our OCR engine extracts all the details in seconds.', icon: Camera },
  { num: '02', title: 'We Organize Everything', desc: 'Bills are categorized, warranty dates tracked, and everything is searchable instantly.', icon: FileCheck },
  { num: '03', title: 'Get Timely Alerts', desc: 'Receive smart email reminders before any warranty expires. Never miss a claim again.', icon: MailCheck },
];

/* ─── Dashboard Mockup Component ─── */
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16">
      {/* Glow behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/10 to-accent/15 rounded-3xl blur-3xl opacity-60" />

      {/* Main card */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-bg-surface/80 backdrop-blur-xl overflow-hidden mockup-glow">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-bg-main/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-white/[0.04] text-xs text-text-muted flex items-center gap-2">
              <Lock className="w-3 h-3" /> warrantyvault.app/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Bills', value: '24', icon: Receipt, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Active', value: '18', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Expiring Soon', value: '3', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Expired', value: '3', icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider">{s.label}</span>
                  <div className={`p-1.5 rounded-lg ${s.bg}`}>
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Bill rows */}
          <div className="space-y-2">
            {[
              { name: 'MacBook Pro 16"', store: 'Apple Store', status: 'Active', statusColor: 'bg-emerald-500', date: '2026-08-15', amount: '₹2,49,900' },
              { name: 'Samsung Washing Machine', store: 'Amazon', status: 'Expiring', statusColor: 'bg-amber-500', date: '2026-03-02', amount: '₹34,990' },
              { name: 'Sony WH-1000XM5', store: 'Croma', status: 'Active', statusColor: 'bg-emerald-500', date: '2027-01-20', amount: '₹24,990' },
            ].map((bill) => (
              <div key={bill.name} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${bill.statusColor}`} />
                  <div>
                    <div className="text-sm font-medium">{bill.name}</div>
                    <div className="text-xs text-text-muted">{bill.store}</div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium">{bill.amount}</div>
                  <div className="text-xs text-text-muted">Expires {bill.date}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${bill.statusColor}/20 text-white font-medium hidden md:inline-block`}>
                  {bill.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-main to-transparent rounded-b-2xl" />
    </div>
  );
}

/* ─── Main Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #030712 0%, #050A18 50%, #030712 100%)' }}>

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50 bg-bg-main/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">Warranty</span>
              <span className="text-accent">Vault</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in" className="text-text-muted hover:text-text-main transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/[0.04]">
                Sign In
              </Link>
              <Link href="/sign-up" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-glow">
                Get Started Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-glow flex items-center gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-40 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/[0.12] rounded-full blur-[150px]" />
          <div className="absolute top-60 -left-40 w-[400px] h-[400px] bg-violet-500/[0.08] rounded-full blur-[120px]" />
          <div className="absolute top-80 -right-20 w-[300px] h-[300px] bg-accent/[0.06] rounded-full blur-[100px]" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute top-44 left-[6%] animate-float">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Receipt className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="absolute top-56 right-[8%] animate-float-d1">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <Bell className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="absolute top-[340px] left-[4%] animate-float-d2">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="absolute top-[380px] right-[5%] animate-float-d3">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/10">
              <Camera className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-7">
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-accent/25 bg-accent/[0.08]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-sm text-accent font-medium tracking-wide">Your Digital Warranty Organizer</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.08] tracking-tight">
              Never Lose a{' '}
              <span className="gradient-text">Bill</span>
              {' '}or{' '}
              <span className="gradient-text">Warranty</span>
              <br />
              <span className="text-text-muted/60 text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 block">
                Ever Again
              </span>
            </motion.h1>

            {/* Subline */}
            <motion.p variants={fadeUp} custom={2} className="max-w-2xl mx-auto text-lg sm:text-xl text-text-muted leading-relaxed">
              Store all your purchase bills &amp; warranty cards in one secure vault.
              We&apos;ll remind you before they expire — so you never miss a claim.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <SignedOut>
                <Link href="/sign-up" className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-9 py-4 rounded-2xl text-lg font-bold transition-all btn-glow">
                  Create Your Free Vault
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 text-text-main px-9 py-4 rounded-2xl text-lg font-medium transition-all border border-white/10 hover:border-accent/40 hover:bg-accent/[0.04]">
                  I Already Have an Account
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-9 py-4 rounded-2xl text-lg font-bold transition-all btn-glow">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </SignedIn>
            </motion.div>

            {/* Trust */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted/60">
              {['Free forever', 'No credit card', 'Secure & private'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/70" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease }}>
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* ═══ PROBLEM SECTION ═══ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-block text-red-400 font-semibold text-sm uppercase tracking-[0.2em] mb-4">
              The Problem
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold mb-5">
              Sound <span className="gradient-text-gold">Familiar</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted text-lg max-w-xl mx-auto">
              The warranty expires just when the product breaks.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FolderOpen, title: 'Bills everywhere', desc: 'Paper in drawers, PDFs in emails, photos on WhatsApp. Finding the right one is a nightmare.', color: '#EF4444', gradient: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.25)' },
              { icon: Clock, title: 'Missed warranty claims', desc: 'Your appliance broke but the warranty expired last week. You had no idea it was about to end.', color: '#F59E0B', gradient: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.25)' },
              { icon: Receipt, title: 'Hours of searching', desc: 'The service center asks for the bill. You spend hours digging through files and folders.', color: '#A855F7', gradient: 'rgba(168, 85, 247, 0.06)', border: 'rgba(168, 85, 247, 0.25)' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                custom={i}
                className="problem-card cursor-default"
                style={{ '--problem-gradient': `radial-gradient(ellipse at center, ${item.gradient}, transparent 70%)`, '--problem-border': item.border } as React.CSSProperties}
              >
                <div className="p-3.5 rounded-xl inline-flex mb-5" style={{ background: `${item.color}15` }}>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-text-muted text-[15px] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* ═══ FEATURES ═══ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.04] rounded-full blur-[180px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-block text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-4">
              The Solution
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold mb-5">
              One <span className="gradient-text">Vault</span> for Everything
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted text-lg max-w-2xl mx-auto">
              Everything you need to organize, protect, and never forget about your purchases.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={scaleIn}
                custom={i}
                className="feature-card cursor-default"
                style={{ '--card-gradient': f.gradient, '--card-glow': f.glow } as React.CSSProperties}
              >
                <div className="feature-icon" style={{ background: f.iconBg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.iconColor }} />
                </div>
                <h3 className="text-lg font-bold mb-2.5">{f.title}</h3>
                <p className="text-text-muted text-[15px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} custom={0} className="inline-block text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold">
              Three Steps to <span className="gradient-text">Peace of Mind</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid md:grid-cols-3 gap-12 relative">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i} className="relative text-center">
                {i < 2 && <div className="step-connector hidden md:block" />}
                <div className="step-number mx-auto mb-6">{step.num}</div>
                <div className="inline-flex p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-text-muted text-[15px] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* ═══ STATS BANNER ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="relative rounded-3xl overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-accent/30 rounded-3xl p-px">
              <div className="w-full h-full bg-bg-main rounded-3xl" />
            </div>
            <div className="relative rounded-3xl border border-white/[0.06] bg-bg-surface/40 backdrop-blur-xl p-10 sm:p-14">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '100%', label: 'Free Forever', icon: Zap, color: 'text-amber-400' },
                  { value: '256-bit', label: 'Encryption', icon: Lock, color: 'text-emerald-400' },
                  { value: '<2min', label: 'To Add a Bill', icon: Camera, color: 'text-blue-400' },
                  { value: '∞', label: 'Bills Stored', icon: Star, color: 'text-purple-400' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} variants={scaleIn} custom={i + 1}>
                    <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                    <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1.5">{stat.value}</div>
                    <div className="text-text-muted text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold mb-4">
              Built for People Who Value<br />
              <span className="gradient-text-gold">Their Peace of Mind</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-text-muted text-lg mb-10">
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
                <span key={a.label} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-sm text-text-main hover:border-accent/30 hover:bg-accent/[0.04] transition-all cursor-default">
                  <span>{a.emoji}</span> {a.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.08] rounded-full blur-[150px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/[0.08] mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Start in 30 seconds</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold mb-5">
              Start Protecting Your<br />Purchases <span className="gradient-text-gold">Today</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted text-lg mb-10">
              Join thousands who never worry about losing a bill or missing a warranty window.
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <SignedOut>
                <Link href="/sign-up" className="group inline-flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all btn-glow">
                  Create Your Free Account
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="group inline-flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all btn-glow">
                  Open Your Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </SignedIn>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tight">
              <span className="text-primary">Warranty</span><span className="text-accent">Vault</span>
            </span>
          </div>
          <p className="text-text-muted/50 text-sm">© {new Date().getFullYear()} Warranty Vault. Your bills are safe with us.</p>
        </div>
      </footer>
    </div>
  );
}
