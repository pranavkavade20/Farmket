import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'brand' | 'warning';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon,
}) => {
  const iconVariants = {
    danger: {
      defaultIcon: <AlertCircle className="w-6 h-6 text-danger" />,
      bg: 'bg-danger-muted/60 border-danger/30',
      confirmButtonVariant: 'danger' as const,
    },
    warning: {
      defaultIcon: <AlertTriangle className="w-6 h-6 text-warning" />,
      bg: 'bg-warning-muted/60 border-warning/30',
      confirmButtonVariant: 'brand' as const,
    },
    brand: {
      defaultIcon: <HelpCircle className="w-6 h-6 text-brand" />,
      bg: 'bg-brand-muted/60 border-brand/30',
      confirmButtonVariant: 'brand' as const,
    },
  };

  const currentVariant = iconVariants[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={!isLoading}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={currentVariant.confirmButtonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-2">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs',
            currentVariant.bg
          )}
        >
          {icon || currentVariant.defaultIcon}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-display font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-foreground-secondary leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
};
