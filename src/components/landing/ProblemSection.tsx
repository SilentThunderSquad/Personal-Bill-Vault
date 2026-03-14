import { motion } from 'framer-motion';
import { FileX, Clock, Printer } from 'lucide-react';

const problems = [
  {
    icon: FileX,
    title: 'Lost Invoices',
    description: 'Paper bills get misplaced, damaged, or lost. When you need them for warranty claims, they are nowhere to be found.',
  },
  {
    icon: Clock,
    title: 'Forgotten Warranties',
    description: 'You buy a product with a 2-year warranty but forget about it. By the time something breaks, the warranty has expired.',
  },
  {
    icon: Printer,
    title: 'Fading Paper Bills',
    description: 'Thermal receipts fade over time, making them unreadable. You lose proof of purchase and warranty coverage.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Problem with Paper Bills
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Traditional bill management fails you when it matters most
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              className="bg-card border border-border rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
