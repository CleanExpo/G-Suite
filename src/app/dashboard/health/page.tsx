import SystemHealth from '@/components/system-health';

export const metadata = {
    title: 'System Health | G-Pilot',
    description: 'Real-time monitoring of G-Pilot platform health and Google product connections'
};

export default function HealthDashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        System Health Dashboard
                    </h1>
                    <p className="text-white/60">
                        Real-time monitoring of G-Pilot agents, skills, and Google product connections
                    </p>
                </header>

                <SystemHealth />
            </div>
        </div>
    );
}
