import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-accent">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-accent hover:bg-accent/90 h-11 text-base">
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
