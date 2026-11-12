import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { TableRowSkeleton } from './Skeleton';
import { EmptyState, type EmptyStateActionConfig } from './EmptyState';
import { Button } from './Button';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
  pagination?: PaginationConfig;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  emptyState?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode | EmptyStateActionConfig;
  };
  className?: string;
}

export function DataTable<T extends Record<string, unknown> | { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 4,
  onRowClick,
  pagination,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  renderMobileCard,
  emptyState,
  className,
}: DataTableProps<T>) {
  // Internal sort state fallback
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null);
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc');

  const activeSortKey = controlledSortKey ?? internalSortKey;
  const activeSortDir = controlledSortDirection ?? internalSortDir;

  const handleSort = (key: string) => {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (activeSortKey === key && activeSortDir === 'asc') {
      nextDir = 'desc';
    }

    if (onSort) {
      onSort(key, nextDir);
    } else {
      setInternalSortKey(key);
      setInternalSortDir(nextDir);
    }
  };

  // Client-side sort fallback if unhandled externally
  const sortedData = useMemo(() => {
    if (onSort || !activeSortKey) return data;
    return [...data].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[activeSortKey];
      const valB = (b as Record<string, unknown>)[activeSortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return activeSortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return activeSortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [data, activeSortKey, activeSortDir, onSort]);

  const alignClasses = {
    left: 'text-left justify-start',
    center: 'text-center justify-center',
    right: 'text-right justify-end',
  };

  const isEmpty = !isLoading && sortedData.length === 0;

  return (
    <div className={cn('w-full flex flex-col space-y-4', className)}>
      {/* Mobile Card Stack Fallback (if renderMobileCard is provided) */}
      {renderMobileCard && (
        <div className="block sm:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-surface border border-border-subtle animate-pulse h-28" />
            ))
          ) : isEmpty ? (
            <EmptyState
              icon={emptyState?.icon}
              title={emptyState?.title || 'No data found'}
              description={emptyState?.description || 'There are no records to display at this time.'}
              action={emptyState?.action}
              size="sm"
            />
          ) : (
            sortedData.map((row, idx) => (
              <div
                key={(row as { id?: string | number }).id ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-all duration-200',
                  onRowClick && 'cursor-pointer active:scale-[0.99]'
                )}
              >
                {renderMobileCard(row, idx)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Standard Table (always rendered on tablet/desktop, hidden on mobile if renderMobileCard provided) */}
      <div
        className={cn(
          'w-full rounded-2xl border border-border-subtle bg-surface shadow-xs overflow-hidden',
          renderMobileCard ? 'hidden sm:block' : 'block'
        )}
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            {/* Header */}
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated/70">
                {columns.map((col) => {
                  const isSorted = activeSortKey === col.key;
                  const align = col.align || 'left';

                  return (
                    <th
                      key={col.key}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground-secondary select-none whitespace-nowrap',
                        col.headerClassName
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={cn(
                            'inline-flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer focus-ring rounded-md',
                            alignClasses[align]
                          )}
                        >
                          <span>{col.header}</span>
                          <span className="text-muted group-hover:text-foreground">
                            {isSorted ? (
                              activeSortDir === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-brand" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-brand" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <div className={cn('flex items-center', alignClasses[align])}>
                          {col.header}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border-subtle/80">
              {isLoading ? (
                <TableRowSkeleton columns={columns.length} rows={skeletonRows} />
              ) : isEmpty ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 px-6">
                    <EmptyState
                      icon={emptyState?.icon}
                      title={emptyState?.title || 'No data found'}
                      description={emptyState?.description || 'There are no records to display at this time.'}
                      action={emptyState?.action}
                      size="sm"
                    />
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rIdx) => (
                  <tr
                    key={(row as { id?: string | number }).id ?? rIdx}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'transition-colors duration-150',
                      onRowClick ? 'cursor-pointer hover:bg-state-hover active:bg-state-active' : 'hover:bg-state-hover/50'
                    )}
                  >
                    {columns.map((col) => {
                      const align = col.align || 'left';
                      const cellContent = col.render
                        ? col.render(row, rIdx)
                        : (row as Record<string, unknown>)[col.key] != null
                        ? String((row as Record<string, unknown>)[col.key])
                        : null;

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'px-5 py-4 align-middle text-foreground font-medium',
                            align === 'right' && 'text-right',
                            align === 'center' && 'text-center',
                            align === 'left' && 'text-left',
                            col.className
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border-subtle bg-surface-elevated/40 text-xs text-foreground-secondary">
            <div className="font-medium">
              {pagination.totalCount !== undefined ? (
                <span>
                  Showing{' '}
                  <strong className="text-foreground font-semibold">
                    {Math.min(
                      (pagination.currentPage - 1) * (pagination.pageSize || 10) + 1,
                      pagination.totalCount
                    )}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-foreground font-semibold">
                    {Math.min(
                      pagination.currentPage * (pagination.pageSize || 10),
                      pagination.totalCount
                    )}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-foreground font-semibold">
                    {pagination.totalCount}
                  </strong>{' '}
                  results
                </span>
              ) : (
                <span>
                  Page <strong className="text-foreground font-semibold">{pagination.currentPage}</strong> of{' '}
                  <strong className="text-foreground font-semibold">{pagination.totalPages}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-lg text-xs"
                disabled={pagination.currentPage <= 1 || isLoading}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <span className="px-2 font-semibold text-foreground">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-lg text-xs"
                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
