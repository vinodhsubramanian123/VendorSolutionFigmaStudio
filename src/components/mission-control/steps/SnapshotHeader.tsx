import React from "react";
import { CheckCircle } from "lucide-react";

export function SnapshotHeader() {
  return (
    <div className="flex items-center gap-2.5 text-left mb-3">
      <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center">
        <CheckCircle className="w-5 h-5 text-status-success" />
      </div>
      <div>
        <p className="text-xs text-white font-bold uppercase">
          Locked PO & Sourcing Ledger Committed
        </p>
        <p className="text-[10px] text-gray-500">
          This UCID transaction pipeline is fully synced and archived.
        </p>
      </div>
    </div>
  );
}
