import type { RoomStatus } from '../types/api'

const STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; dot: string }> = {
  idle: {
    label: 'Idle',
    color: 'text-gray-400 bg-gray-400/10',
    dot: 'bg-gray-400',
  },
  waiting_for_host: {
    label: 'Waiting for host',
    color: 'text-warning bg-warning/10',
    dot: 'bg-warning animate-pulse',
  },
  live: {
    label: 'Live',
    color: 'text-success bg-success/10',
    dot: 'bg-success animate-pulse',
  },
  ended: {
    label: 'Ended',
    color: 'text-danger bg-danger/10',
    dot: 'bg-danger',
  },
}

interface StatusBadgeProps {
  status: RoomStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
