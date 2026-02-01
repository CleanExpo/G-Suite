'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import { getWalletData } from '@/actions/wallet-actions';
import { useAuth } from '@/components/auth/auth-provider';
import {
  Wallet,
  Rocket,
  Activity,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Target,
  Shield,
  History,
  Lock as LockIcon,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { getLatestReport } from '@/actions/mission-history';
import { useTranslations } from 'next-intl';

// Dynamic imports for code splitting - heavy components loaded on demand
const MissionModal = dynamic(() => import('@/components/MissionModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false,
});

const CreditDialog = dynamic(
  () =>
    import('@/components/credit-dialog').then((mod) => ({
      default: mod.default || mod.CreditDialog,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

const TelemetryPanel = dynamic(
  () => import('@/components/telemetry-panel').then((mod) => ({ default: mod.TelemetryPanel })),
  {
    loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />,
  },
);

const FleetStatus = dynamic(
  () => import('@/components/fleet-status').then((mod) => ({ default: mod.FleetStatus })),
  {
    loading: () => <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />,
  },
);

const IntelligenceDossier = dynamic(
  () =>
    import('@/components/intelligence-dossier').then((mod) => ({
      default: mod.IntelligenceDossier,
    })),
  {
    loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />,
  },
);

function AuthenticatedDashboard({
  onOpenModal,
  onOpenCreditDialog,
}: {
  onOpenModal: () => void;
  onOpenCreditDialog: () => void;
}) {
  const t = useTranslations('Dashboard');
  const [wallet, setWallet] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]); // New state for missions
  const [latestReport, setLatestReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchData() {
    try {
      const [walletData, missionData, reportData] = await Promise.all([
        getWalletData(),
        import('@/actions/mission-history').then((mod) => mod.getMissionHistory()),
        getLatestReport(),
      ]);
      setWallet(walletData);
      setMissions(missionData);
      setLatestReport(reportData);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-[2rem] border-4 border-blue-600 border-t-transparent shadow-2xl shadow-blue-600/20"
        />
        <div className="space-y-2 text-center">
          <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            {t('statusSyncing')}
          </p>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest opacity-50">
            {t('coreActive')}
          </p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xl mx-auto bg-white dark:bg-[#161b22] p-16 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-2xl text-center space-y-10"
      >
        <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center rounded-2xl md:rounded-[2.5rem] mx-auto border border-amber-100 dark:border-amber-800">
          <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase dark:text-white mb-4 leading-none">
            {t('uplinkInvalid')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg font-medium leading-relaxed">
            {t('noLedger')}
          </p>
        </div>
        <button
          onClick={onOpenCreditDialog}
          className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-2xl transition-all shadow-2xl shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-4"
        >
          {t('initializeVault')} <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      {/* Live Telemetry Node */}
      <TelemetryPanel />

      {/* Tactical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
        {/* Intelligence Dossier - High Impact */}
        {latestReport && <IntelligenceDossier report={latestReport} />}

        {/* Ledger Card: Multi-Layer Spatial */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-1 bg-white dark:bg-[#161b22] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
        >
          <div className="absolute top-0 right-0 p-6 md:p-10 flex flex-col items-end gap-4 md:gap-6">
            <div className="flex gap-4">
              <Link href="/dashboard/telemetry">
                <button className="bg-gray-50 dark:bg-white/5 hover:bg-purple-600 hover:text-white p-2 md:p-3 rounded-xl transition-all active:scale-90 border border-gray-100 dark:border-white/10 group/telemetry">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </Link>
              <Link href="/dashboard/vault">
                <button className="bg-gray-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white p-2 md:p-3 rounded-xl transition-all active:scale-90 border border-gray-100 dark:border-white/10 group/vault">
                  <Shield className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </Link>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800 group-hover:bg-blue-600 transition-all duration-500">
                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <button
              onClick={onOpenCreditDialog}
              className="bg-gray-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white p-2 md:p-3 rounded-xl transition-all active:scale-90 border border-gray-100 dark:border-white/10"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="space-y-8 md:space-y-12">
            <div>
              <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                {t('fuelReserve')}
              </h3>
              <div className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter flex items-baseline gap-2 leading-none">
                {wallet.balance.toLocaleString()}
                <span className="text-lg md:text-2xl text-blue-600 font-black uppercase italic tracking-widest">
                  PTS
                </span>
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                <span>{t('estimatedValue')}</span>
                <span className="text-gray-900 dark:text-white text-base md:text-lg font-black">
                  ${(wallet.balance / 100).toFixed(2)} USD
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: '70%' }} className="h-full bg-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Command Launchpad: Kinetic Energy */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={onOpenModal}
          className="lg:col-span-2 bg-blue-600 p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[4.5rem] shadow-[0_50px_100px_rgba(37,99,235,0.2)] flex flex-col justify-between group overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="absolute top-0 right-0 p-8 md:p-16 opacity-10 group-hover:scale-150 transition-transform duration-1000 pointer-events-none">
            <Cpu className="w-32 h-32 md:w-64 md:h-64 text-white" />
          </div>

          <div className="space-y-6 md:space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/30">
                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-white font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] opacity-80">
                Command Authority v9.4
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-[7rem] font-black italic uppercase text-white tracking-tighter leading-[0.8]">
              {t('deployMission').split(' ')[0]} <br className="hidden md:block" />
              <span className="text-blue-200">
                {t('deployMission').split(' ').slice(1).join(' ')}.
              </span>
            </h2>
            <p className="text-blue-100/70 text-lg md:text-2xl font-medium max-w-xl leading-relaxed italic">
              "{t('description')}"
            </p>
          </div>

          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 group relative z-10">
            <div className="h-16 md:h-24 px-8 md:px-12 bg-white text-blue-600 rounded-xl md:rounded-[2rem] font-black flex items-center justify-center gap-4 group-hover:bg-gray-50 shadow-2xl text-xl md:text-2xl transition-all w-full sm:w-auto">
              {t('ignite')}{' '}
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform" />
            </div>
            <div className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full border border-white/20 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest backdrop-blur-md w-fit">
              <Shield className="w-3 h-3 md:w-4 md:h-4" /> {t('vaultActive')}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fleet Readiness Node */}
      <FleetStatus />

      {/* Audit Archive: High-Fidelity Ledger */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#161b22] rounded-[2.5rem] md:rounded-[4.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
      >
        <div className="px-6 md:px-12 py-8 md:py-12 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <History className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="font-black italic uppercase tracking-tighter text-2xl md:text-4xl text-gray-900 dark:text-white leading-none">
              {t('archive')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              {t('globalTelemetrySync')}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-6 md:px-12 py-6 md:py-10 text-[10px] md:text-[12px] font-black text-gray-400 uppercase tracking-[0.3em]">
                  {t('deploymentProfile')}
                </th>
                <th className="px-6 md:px-12 py-6 md:py-10 text-[10px] md:text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">
                  {t('fuelDelta')}
                </th>
                <th className="px-6 md:px-12 py-6 md:py-10 text-[10px] md:text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">
                  {t('timestamp')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {missions.map((mission: any, idx: number) => (
                <motion.tr
                  key={mission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-default"
                >
                  <td className="px-6 md:px-12 py-6 md:py-10">
                    <div className="flex items-center gap-4 md:gap-8">
                      <div
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border flex items-center justify-center shrink-0 transition-all ${mission.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600'}`}
                      >
                        {mission.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                        ) : (
                          <Activity className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 dark:text-white text-lg md:text-2xl italic tracking-tighter uppercase leading-none mb-1 md:mb-2 truncate">
                          {mission.result?.data?.missionId
                            ? `Mission: ${mission.result.data.missionId.slice(0, 8)}`
                            : 'Mission Execution'}
                        </p>
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-gray-400">
                            ID: {mission.id.slice(0, 8)}
                          </span>
                          <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
                          <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-blue-600">
                            {mission.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={'px-6 md:px-12 py-6 md:py-10 text-center'}>
                    <div
                      className={
                        'inline-flex items-center justify-center h-12 md:h-16 px-4 md:px-8 rounded-xl md:rounded-[1.5rem] font-black text-xl md:text-3xl font-mono tracking-tighter text-gray-900 dark:text-white bg-gray-50 dark:bg-white/10'
                      }
                    >
                      {mission.cost} PTS
                    </div>
                  </td>
                  <td className="px-6 md:px-12 py-6 md:py-10 text-right">
                    <div className="text-gray-900 dark:text-white font-black text-sm md:text-lg tracking-tight uppercase italic">
                      {format(new Date(mission.createdAt), 'dd MMM · HH:mm')}
                    </div>
                    <div className="text-[8px] md:text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1 md:mt-2 flex items-center justify-end gap-1 md:gap-2">
                      <Shield className="w-2 md:w-3 h-2 md:h-3 text-emerald-500" /> {t('verified')}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {wallet.transactions.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-40 text-center">
                    <div className="flex flex-col items-center gap-8 opacity-20 group">
                      <Target className="w-24 h-24 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="space-y-2">
                        <p className="text-3xl font-black uppercase italic tracking-tighter">
                          {t('sectorSilence')}
                        </p>
                        <p className="text-xs font-black uppercase tracking-[0.4em]">
                          {t('establishFlow')}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const prompt = searchParams.get('prompt');

    if (success === 'true') {
      setNotification({
        type: 'success',
        message: 'Uplink Restored: Ledger Replenished Successfully.',
      });
      router.replace('/dashboard');
    } else if (canceled === 'true') {
      setNotification({
        type: 'info',
        message: 'Uplink Terminated: Secure Checkout Aborted.',
      });
      router.replace('/dashboard');
    } else if (prompt) {
      setIsModalOpen(true);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors relative font-sans overflow-x-hidden">
      <Navbar />

      {/* High-Fidelity Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -100, x: '-50%', opacity: 0, scale: 0.9 }}
            animate={{ y: 80, x: '-50%', opacity: 1, scale: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0, scale: 0.9 }}
            className="fixed top-0 left-1/2 z-[300] w-full max-w-md px-6"
          >
            <div
              className={`p-6 rounded-[2rem] border shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex items-center gap-6 ${
                notification.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-blue-600 text-white border-blue-500'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">
                  System Message
                </p>
                <p className="text-lg font-black italic uppercase tracking-tighter">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="p-2 opacity-50 hover:opacity-100 transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 p-6 md:p-12 lg:pt-32 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-[2rem] border-4 border-blue-600 border-t-transparent shadow-2xl shadow-blue-600/20"
            />
          </div>
        ) : user ? (
          <AuthenticatedDashboard
            onOpenModal={() => setIsModalOpen(true)}
            onOpenCreditDialog={() => setIsCreditDialogOpen(true)}
          />
        ) : (
          <div className="text-center py-40 space-y-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.3em] shadow-sm"
            >
              <LockIcon className="w-4 h-4" /> Secure Hub Lockdown
            </motion.div>
            <h2 className="text-4xl md:text-7xl lg:text-[10rem] font-black italic tracking-tighter uppercase dark:text-white leading-[0.75]">
              Verify your <br />
              <span className="text-blue-600">Identity.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              The G-Pilot Mission Hub requires an encrypted secure session to access the tactical
              dashboard and mission ledger.
            </p>
            <div className="flex items-center justify-center gap-8 pt-12 text-center">
              <Link href="/sign-in">
                <button className="h-16 md:h-24 px-8 md:px-16 bg-blue-600 text-white rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl hover:scale-105 transition-all shadow-[0_30px_60px_rgba(37,99,235,0.3)] active:scale-95 group flex items-center gap-4 mx-auto">
                  Initialize Login{' '}
                  <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <MissionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => window.location.reload()}
            initialInput={searchParams.get('prompt') || ''}
          />
        )}
        {isCreditDialogOpen && (
          <CreditDialog isOpen={isCreditDialogOpen} onClose={() => setIsCreditDialogOpen(false)} />
        )}
      </AnimatePresence>

      {/* Background Texture (Spatial) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05] grayscale">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#0b0e14] flex flex-col items-center justify-center gap-8">
          <div className="w-20 h-20 rounded-[2rem] border-4 border-blue-600 border-t-transparent animate-spin shadow-2xl shadow-blue-600/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">
            Syncing G-Pilot Core
          </p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
