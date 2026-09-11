import React from 'react';
import type { AttentionItem } from '../utils/cropUtils';
import { AlertCircle, Clock, Users, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui';

interface CropNeedsAttentionProps {
  items: AttentionItem[];
  onUpdateStage: (cropId: number) => void;
  onViewDetails: (cropId: number) => void;
}

export const CropNeedsAttention: React.FC<CropNeedsAttentionProps> = ({
  items,
  onUpdateStage,
  onViewDetails,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand/5 border border-brand/20 text-foreground">
        <div className="w-8 h-8 rounded-xl bg-brand/15 text-brand flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            You're all caught up 🌱
          </p>
          <p className="text-xs text-foreground-secondary">
            All your crops are on schedule and there are no pending buyer requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning"></span>
          </span>
          <h2 className="text-sm sm:text-base font-display font-bold text-foreground">
            Needs Attention
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-muted text-warning border border-warning/20">
            {items.length} {items.length === 1 ? 'action' : 'actions'}
          </span>
        </div>
        <span className="text-xs text-muted font-medium hidden sm:inline-block">
          Crops requiring updates or reservation reviews
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const isOverdue = item.type === 'OVERDUE';
          const isReservation = item.type === 'PENDING_RESERVATIONS';

          return (
            <div
              key={`${item.id}-${item.type}`}
              className={`p-4 rounded-2xl bg-surface border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isOverdue
                  ? 'border-danger/30 hover:border-danger/50'
                  : isReservation
                  ? 'border-warning/30 hover:border-warning/50'
                  : 'border-border-subtle hover:border-brand/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isOverdue
                          ? 'bg-danger/10 text-danger'
                          : isReservation
                          ? 'bg-warning/10 text-warning'
                          : 'bg-brand/10 text-brand'
                      }`}
                    >
                      {isReservation ? (
                        <Users className="w-4 h-4" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-foreground text-sm truncate">
                      {item.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeClass}`}
                  >
                    {item.badgeLabel}
                  </span>
                </div>

                <p className="text-xs text-foreground-secondary line-clamp-2 mb-4 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(item.id)}
                  className="flex-1 text-xs py-2 h-auto rounded-xl gap-1"
                >
                  View Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>

                <Button
                  size="sm"
                  variant={isOverdue ? 'danger' : 'brand'}
                  onClick={() => {
                    if (isReservation) {
                      onViewDetails(item.id);
                    } else {
                      onUpdateStage(item.id);
                    }
                  }}
                  className="flex-1 text-xs py-2 h-auto rounded-xl gap-1 font-semibold"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {isReservation ? 'Review' : 'Update Stage'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
