import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backLink?: {
    to: string;
    label?: string;
  };
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  backLink,
  breadcrumbs,
  className,
}) => {
  return (
    <header className={cn('w-full flex flex-col gap-3 pb-2', className)}>
      {/* Optional Breadcrumbs */}
      {breadcrumbs && <nav aria-label="Breadcrumb">{breadcrumbs}</nav>}

      {/* Optional Back Navigation Link */}
      {backLink && (
        <div>
          <Link
            to={backLink.to}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground-secondary hover:text-brand transition-colors group focus-ring rounded-md py-0.5 px-1 -ml-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLink.label || 'Back'}</span>
          </Link>
        </div>
      )}

      {/* Main Header Content: Title + Description on left, Actions on right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight break-words sm:truncate">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm font-medium text-foreground-secondary max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
