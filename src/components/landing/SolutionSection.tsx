import { motion } from 'framer-motion';
import { ShieldCheck, Scan, BellRing, FolderLock } from 'lucide-react';

const solutions = [
  { icon: FolderLock, title: 'Digital Storage', description: 'Store all your bills securely in the cloud. Access them anytime, anywhere.' },
  { icon: Scan, title: 'Smart OCR', description: 'Our AI-powered scanner automatically extracts key information from your bills.' },
  { icon: ShieldCheck, title: 'Warranty Tracking', description: 'Automatically track warranty periods and never miss a claim deadline.' },
  { icon: BellRing, title: 'Timely Alerts', description: 'Get notified before warranties expire so you can take action.' },
];

export function SolutionSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            The Solution: <span className="text-accent">Bill Vault</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            A complete digital vault for your invoices and warranties
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-accent/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 mb-3 sm:mb-4">
                <solution.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">{solution.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{solution.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
