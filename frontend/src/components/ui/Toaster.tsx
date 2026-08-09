import React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border-subtle group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-foreground-secondary',
          actionButton:
            'group-[.toast]:bg-brand group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-secondary group-[.toast]:text-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
