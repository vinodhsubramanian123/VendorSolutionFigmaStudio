import React from 'react';
import { TableRow, TableCell } from './Table';

interface SkeletonRowProps {
  columns?: number;
}

export function SkeletonRow({ columns = 5 }: SkeletonRowProps) {
  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
        </TableCell>
      ))}
    </TableRow>
  );
}
