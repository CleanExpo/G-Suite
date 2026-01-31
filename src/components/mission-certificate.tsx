'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MissionCertificateProps {
  /** Mission ID */
  missionId: string;
  /** Mission title/description */
  missionTitle: string;
  /** User name */
  userName: string;
  /** Completion date */
  completedAt: Date;
  /** Mission cost/credits used */
  creditsUsed: number;
  /** Quality score (0-100) */
  qualityScore?: number;
  /** Agents used in mission */
  agentsUsed?: string[];
  /** Additional className */
  className?: string;
  /** On download click */
  onDownload?: () => void;
  /** On share click */
  onShare?: () => void;
}

/**
 * Mission Completion Certificate
 *
 * Displays a shareable certificate for completed missions.
 * Can be exported as image or shared.
 */
export function MissionCertificate({
  missionId,
  missionTitle,
  userName,
  completedAt,
  creditsUsed,
  qualityScore,
  agentsUsed = [],
  className,
  onDownload,
  onShare,
}: MissionCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formattedDate = format(completedAt, 'dd MMMM yyyy');
  const formattedTime = format(completedAt, 'HH:mm');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Certificate Card */}
      <motion.div
        ref={certificateRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800',
          'rounded-3xl p-8 md:p-12',
          'text-white'
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] opacity-70">
                G-Pilot Mission
              </div>
              <div className="font-mono text-sm opacity-90">
                {missionId.slice(0, 12)}
              </div>
            </div>
          </div>

          {qualityScore !== undefined && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Quality Score
              </div>
              <div className="text-3xl font-bold">
                {qualityScore}%
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="relative space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] opacity-70 mb-2">
              Certificate of Completion
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
              {missionTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-lg">
              Successfully completed by <strong>{userName}</strong>
            </span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Date
              </div>
              <div className="font-semibold">{formattedDate}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Time
              </div>
              <div className="font-semibold">{formattedTime} AEST</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Credits Used
              </div>
              <div className="font-semibold">{creditsUsed} PTS</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Agents
              </div>
              <div className="font-semibold">{agentsUsed.length}</div>
            </div>
          </div>

          {/* Agents Used */}
          {agentsUsed.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {agentsUsed.map((agent, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10"
                >
                  {agent}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
          <div className="text-xs opacity-70">
            Verified by G-Pilot AI Orchestration Platform
          </div>
          <div className="text-xs font-mono opacity-50">
            #{missionId.slice(-8).toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onDownload && (
          <button
            onClick={onDownload}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'h-12 rounded-xl',
              'bg-gray-100 dark:bg-white/5',
              'text-gray-700 dark:text-gray-300 font-medium',
              'transition-colors hover:bg-gray-200 dark:hover:bg-white/10',
              'active:scale-[0.98]'
            )}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'h-12 rounded-xl',
              'bg-blue-600 hover:bg-blue-700',
              'text-white font-medium',
              'transition-colors',
              'active:scale-[0.98]'
            )}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Mini Certificate Badge
 *
 * Compact version for showing in lists or cards.
 */
export function CertificateBadge({
  missionId,
  completedAt,
  qualityScore,
  onClick,
}: {
  missionId: string;
  completedAt: Date;
  qualityScore?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-gradient-to-r from-blue-600/10 to-indigo-600/10',
        'border border-blue-200 dark:border-blue-800',
        'transition-all hover:shadow-md',
        'group'
      )}
    >
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
        <Award className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Mission Complete
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {format(completedAt, 'dd MMM yyyy')}
        </div>
      </div>
      {qualityScore !== undefined && (
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{qualityScore}%</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400">Score</div>
        </div>
      )}
    </button>
  );
}
