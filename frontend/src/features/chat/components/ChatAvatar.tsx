import React from 'react';

interface Props {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
}

const COLORS = ['#16a34a','#0284c7','#7c3aed','#db2777','#ea580c','#0d9488'];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export const ChatAvatar: React.FC<Props> = ({ name, src, size = 40, online }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} className="rounded-full object-cover w-full h-full" />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-white font-bold select-none"
          style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.36 }}
        >
          {initials}
        </div>
      )}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
};
