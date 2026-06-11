import React from 'react';
import { FileDiff } from 'lucide-react';

export function ReconciliationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-status-success/20 bg-black/10 rounded-xl m-6 p-12 text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-6 border border-status-success/20">
        <FileDiff className="w-8 h-8 text-status-success" />
      </div>
      <h2 className="text-xl font-bold text-content-primary mb-2">No Reconciliation Discrepancies</h2>
      <p className="text-content-muted text-sm max-w-md">
        Sourced configurations match baseline parameters perfectly.
      </p>
    </div>
  );
}
