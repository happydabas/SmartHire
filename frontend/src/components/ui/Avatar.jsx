import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const sizes = {
    sm: 'w-8 h-8 text-[11px] font-bold',
    md: 'w-10 h-10 text-xs font-extrabold',
    lg: 'w-12 h-12 text-sm font-black'
  };

  const currentSizeClass = sizes[size] || sizes.md;

  const initials = getInitials(name);

  // Generate a deterministic gradient class based on initials
  const getGradientClass = (char) => {
    const code = char.charCodeAt(0) || 0;
    const gradients = [
      'from-blue-500 to-indigo-600 text-white',
      'from-purple-500 to-indigo-600 text-white',
      'from-emerald-400 to-teal-600 text-white',
      'from-rose-500 to-pink-600 text-white',
      'from-amber-400 to-orange-500 text-white',
      'from-cyan-400 to-blue-500 text-white'
    ];
    return gradients[code % gradients.length];
  };

  const gradientClass = getGradientClass(initials[0] || 'A');

  return (
    <div
      className={twMerge(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-slate-100/50 shadow-sm bg-gradient-to-tr select-none',
        currentSizeClass,
        src && !imageError ? 'bg-white' : gradientClass,
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
