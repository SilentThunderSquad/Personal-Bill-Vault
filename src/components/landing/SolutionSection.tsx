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
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Solution: <span className="text-accent">Bill Vault</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete digital vault for your invoices and warranties
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-accent/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 mb-4">
                <solution.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{solution.title}</h3>
              <p className="text-muted-foreground text-sm">{solution.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
