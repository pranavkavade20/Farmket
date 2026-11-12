import React, { useState } from 'react';
import { resolveMedia } from '../services/chatService';
import { cn } from '@/lib/utils/cn';

interface Props {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
  className?: string;
}

const COLORS = [
  '#098541', // Farmket brand green
  '#0284c7', // Sky blue
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#0d9488', // Teal
  '#b45309', // Amber
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export const ChatAvatar: React.FC<Props> = ({ name, src, size = 40, online, className }) => {
  const [imageError, setImageError] = useState(false);
  const initials = (name || 'User')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const resolvedSrc = src ? resolveMedia(src) : null;
  const showImage = resolvedSrc && !imageError;

  return (
    <div
      className={cn('relative flex-shrink-0 select-none', className)}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={name}
          onError={() => setImageError(true)}
          className="rounded-full object-cover w-full h-full border border-border-subtle"
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-white font-bold tracking-wider shadow-xs"
          style={{
            width: size,
            height: size,
            background: colorFor(name || 'User'),
            fontSize: Math.max(10, Math.floor(size * 0.36)),
          }}
        >
          {initials}
        </div>
      )}

      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-success ring-2 ring-surface shadow-xs"
          style={{ width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28) }}
          title="Online"
        >
          <span className="absolute inset-0 rounded-full bg-success opacity-75 animate-ping" />
        </span>
      )}
    </div>
  );
};
