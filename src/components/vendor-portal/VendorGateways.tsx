import React from 'react';
import { Power } from 'lucide-react';
import type { Vendor } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface VendorGatewaysProps {
  vendors: Vendor[];
  handleToggleStatus: (vendorId: string) => void;
}

export function VendorGateways({ vendors, handleToggleStatus }: VendorGatewaysProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vendors.map((vendor) => {
        const isConnected =
          vendor.status === "connected" || vendor.status === "syncing";
        return (
          <div
            key={vendor.id}
            className="p-4 rounded-xl border flex flex-col gap-3.5 transition-all hover:border-indigo-500/20"
            style={{
              backgroundColor: "var(--color-surface-elevated)",
              borderColor: "rgba(74, 133, 253,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between pb-2 border-b"
              style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: vendor.color }}
                />
                <div className="min-w-0">
                  <h3 className="text-xs text-white font-bold truncate">
                    {vendor.name}
                  </h3>
                  <p className="text-[9px] text-gray-500 font-mono font-bold uppercase truncate">
                    {vendor.shortName} CONTRACT SYSTEM
                  </p>
                </div>
              </div>
              <StatusBadge
                status={vendor.status}
                variant={
                  vendor.status === "connected"
                    ? "success"
                    : vendor.status === "syncing"
                      ? "info"
                      : "error"
                }
              />
            </div>

            {/* API Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-black/20 space-y-0.5 border border-white/2">
                <span className="text-gray-500 font-medium text-[9.5px]">
                  Synced SKUs
                </span>
                <p className="text-white font-bold font-mono text-[13px]">
                  {vendor.catalogItems.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded bg-black/20 space-y-0.5 border border-white/2">
                <span className="text-gray-500 font-medium text-[9.5px]">
                  Channel Health
                </span>
                <p
                  className={`font-bold font-mono text-[13px] ${isConnected ? "text-status-success" : "text-red-400"}`}
                >
                  {vendor.apiHealth}%
                </p>
              </div>
            </div>

            {/* REST details */}
            <div className="text-[10px] space-y-1 bg-black/10 p-2.5 rounded-lg font-mono">
              <p className="text-gray-500 truncate">
                <span className="text-indigo-400">Endpoint:</span>{" "}
                {vendor.apiEndpoint}
              </p>
              <div className="flex justify-between text-gray-500">
                <p>
                  Interval:{" "}
                  <span className="text-gray-300">
                    {vendor.syncInterval}
                  </span>
                </p>
                <p>
                  Last Sync:{" "}
                  <span className="text-gray-300">{vendor.lastSync}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 mt-auto">
              <button type="button"
                onClick={() => handleToggleStatus(vendor.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-bold border cursor-pointer transition-colors ${
                  isConnected
                    ? "bg-red-500/10 text-red-400 border-red-500/15 hover:bg-red-500/15"
                    : "bg-status-success/10 text-status-success border-status-success/15 hover:bg-status-success/20"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {isConnected
                  ? "Disconnect System Gateway"
                  : "Sync Sourcing Gateway"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
