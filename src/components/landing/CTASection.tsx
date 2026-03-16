import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export function CTASection() {
  const { user, loading } = useAuth();
  const isSignedIn = !loading && !!user;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <motion.div
        className="max-w-4xl mx-auto text-center bg-gradient-to-br from-accent/10 via-secondary/5 to-accent/10 border border-accent/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
          Ready to Secure Your Warranties?
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto px-2">
          Join thousands of users who never worry about lost bills or expired warranties again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {isSignedIn ? (
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 h-11 sm:h-12 text-base">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 h-11 sm:h-12 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 text-base">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
