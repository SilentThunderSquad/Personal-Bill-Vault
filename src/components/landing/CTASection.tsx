import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <motion.div
        className="max-w-4xl mx-auto text-center bg-gradient-to-br from-accent/10 via-secondary/5 to-accent/10 border border-accent/20 rounded-2xl p-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ready to Secure Your Warranties?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Join thousands of users who never worry about lost bills or expired warranties again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base">Sign In</Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
