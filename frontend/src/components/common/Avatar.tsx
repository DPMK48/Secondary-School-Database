import React from 'react';
import { cn, getInitials, getAvatarColor } from '../../utils/helpers';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
}) => {
  // Support both name prop and firstName/lastName props
  let first = firstName;
  let last = lastName;
  
  if (name) {
    const parts = name.split(' ');
    first = parts[0] || '';
    last = parts.slice(1).join(' ') || '';
  }

  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = getInitials(first, last);
  const colorClass = getAvatarColor(`${first}${last}`);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || `${first} ${last}`}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizes[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
};

export default Avatar;
