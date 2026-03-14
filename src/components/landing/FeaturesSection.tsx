import { motion } from 'framer-motion';
import { ScanLine, ShieldCheck, BellDot, Lock, LayoutDashboard, Tags } from 'lucide-react';

const features = [
  { icon: ScanLine, title: 'Bill Scanner', description: 'Powered by Tesseract.js OCR to auto-extract bill details from photos.' },
  { icon: ShieldCheck, title: 'Warranty Tracker', description: 'Automatically calculates and tracks warranty expiry for every product.' },
  { icon: BellDot, title: 'Smart Alerts', description: 'Email and in-app notifications 30, 7, and 1 day before warranty expires.' },
  { icon: Lock, title: 'Secure Digital Vault', description: 'Your bills are encrypted and stored safely in the cloud with Supabase.' },
  { icon: LayoutDashboard, title: 'Organized Dashboard', description: 'See all your bills, active warranties, and upcoming expirations at a glance.' },
  { icon: Tags, title: 'Smart Categories', description: 'Organize bills by category: Electronics, Appliances, Furniture, and more.' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to manage your bills and warranties
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group bg-card border border-border rounded-xl p-6 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 mb-4 group-hover:from-accent/30 group-hover:to-secondary/30 transition-colors">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
