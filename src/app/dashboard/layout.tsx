import DashboardShell from './DashboardShell';

// Force dynamic rendering — dashboard requires auth, never statically generated
export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <DashboardShell>{children}</DashboardShell>;
}
