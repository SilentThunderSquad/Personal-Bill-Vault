import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-main flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        <span className="text-primary">Warranty</span>
                        <span className="text-accent">Vault</span>
                    </h1>
                    <p className="text-text-muted mt-2">Welcome back! Sign in to your vault.</p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'w-full bg-bg-surface border border-accent-dim shadow-2xl',
                        },
                    }}
                />
            </div>
        </div>
    );
}
