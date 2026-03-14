import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Receipt, Bell } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm text-accent font-medium">Secure Digital Vault</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Never Lose a{' '}
          <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            Warranty
          </span>{' '}
          Again
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Upload your bills, automatically extract invoice data with OCR, track warranty expiry dates,
          and receive smart alerts before your warranties run out.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/register">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base">
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          className="relative mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-accent/5">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { icon: Receipt, label: 'Bills Stored', value: '24' },
                { icon: Shield, label: 'Active Warranties', value: '18' },
                { icon: Bell, label: 'Alerts Set', value: '5' },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted rounded-xl p-4 text-center">
                  <stat.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {['MacBook Pro 16"', 'Samsung TV 55"', 'iPhone 15 Pro'].map((name) => (
                <div key={name} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                  <span className="text-sm text-foreground">{name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
