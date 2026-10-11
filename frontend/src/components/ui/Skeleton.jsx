import React from 'react';
import { cn } from '@/utils/cn';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-paper-border/60 transition-opacity',
        className
      )}
      {...props}
    />
  );
}
