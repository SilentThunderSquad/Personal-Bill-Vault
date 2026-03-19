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
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">How It Works</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Five simple steps to warranty peace of mind
          </p>
        </motion.div>

        {/* Mobile: 2 columns, Desktop: 5 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className={`relative text-center ${index === 4 ? 'col-span-2 sm:col-span-1 max-w-[200px] mx-auto sm:max-w-none' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/10 border border-accent/20 mb-3 sm:mb-4">
                <step.icon className="h-5 w-5 sm:h-6 md:h-7 sm:w-6 md:w-7 text-accent" />
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-accent mb-1">{step.step}</div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
