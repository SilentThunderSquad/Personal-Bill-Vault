import { motion } from 'framer-motion';
import { UserPlus, Upload, ScanSearch, CalendarCheck, BellRing } from 'lucide-react';

const steps = [
  { icon: UserPlus, step: '01', title: 'Sign Up', description: 'Create your free account in seconds' },
  { icon: Upload, step: '02', title: 'Upload or Scan', description: 'Take a photo or upload your bill image' },
  { icon: ScanSearch, step: '03', title: 'OCR Extracts Data', description: 'AI automatically reads your bill details' },
  { icon: CalendarCheck, step: '04', title: 'Track Warranties', description: 'Warranty dates are tracked automatically' },
  { icon: BellRing, step: '05', title: 'Get Reminders', description: 'Receive alerts before warranties expire' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Five simple steps to warranty peace of mind</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                <step.icon className="h-7 w-7 text-accent" />
              </div>
              <div className="text-xs font-bold text-accent mb-1">{step.step}</div>
              <h3 className="text-base font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
