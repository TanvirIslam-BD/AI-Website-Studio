import { cn } from '@/lib/utils';
import type { ProjectStatus, DeploymentStatus } from '@prisma/client';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-sky-50 text-sky-700',
    brand: 'bg-brand-50 text-brand-700',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const PROJECT_TONES: Record<ProjectStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'neutral',
  GENERATING: 'info',
  READY: 'neutral',
  DEPLOYING: 'warning',
  DEPLOYED: 'success',
  ERROR: 'danger',
};

const PROJECT_LABELS: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  GENERATING: 'Generating',
  READY: 'Ready',
  DEPLOYING: 'Deploying',
  DEPLOYED: 'Live',
  ERROR: 'Error',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={PROJECT_TONES[status]}>{PROJECT_LABELS[status]}</Badge>;
}

const DEPLOY_TONES: Record<DeploymentStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'info'> = {
  QUEUED: 'info',
  BUILDING: 'warning',
  READY: 'success',
  ERROR: 'danger',
  CANCELED: 'neutral',
};

const DEPLOY_LABELS: Record<DeploymentStatus, string> = {
  QUEUED: 'Queued',
  BUILDING: 'Building',
  READY: 'Live',
  ERROR: 'Failed',
  CANCELED: 'Canceled',
};

export function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  return <Badge tone={DEPLOY_TONES[status]}>{DEPLOY_LABELS[status]}</Badge>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
      {icon ? <div className="text-ink-400">{icon}</div> : null}
      <div>
        <p className="text-sm font-semibold text-ink-800">{title}</p>
        {description ? <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      aria-hidden
    />
  );
}
