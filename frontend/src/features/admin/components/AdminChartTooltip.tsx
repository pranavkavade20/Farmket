import React from 'react';

export interface AdminChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  prefix?: string;
  suffix?: string;
  valueFormatter?: (val: number) => string;
}

export const AdminChartTooltip: React.FC<AdminChartTooltipProps> = ({
  active,
  payload,
  label,
  prefix = '',
  suffix = '',
  valueFormatter,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface/95 p-3.5 shadow-lg backdrop-blur-md text-xs min-w-[140px] pointer-events-none">
      {label && (
        <p className="font-semibold text-foreground-secondary mb-2 pb-1 border-b border-border-subtle/50">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, idx) => {
          const displayVal = valueFormatter
            ? valueFormatter(entry.value)
            : `${prefix}${entry.value.toLocaleString('en-IN')}${suffix}`;

          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || '#098541' }}
                />
                <span className="font-medium text-foreground-secondary capitalize">
                  {entry.name}:
                </span>
              </div>
              <span className="font-bold text-foreground">
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminChartTooltip;

