import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, CheckCircle, AlertTriangle, Shield, Clock } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import type { CleansingAuditEntry } from '../../types/models/cleansing';

export function CleansingEventLedger() {
  const [events, setEvents] = useState<CleansingAuditEntry[]>([]);

  useEffect(() => {
    // Listen for custom events dispatched when cleansing actions occur
    const handleCleansingEvent = (e: CustomEvent<CleansingAuditEntry>) => {
      setEvents((prev) => [e.detail, ...prev]);
      // Batch commit to API (synchronous fire-and-forget; errors silently logged)
      apiClient.post("/api/cleansing/events", e.detail)?.catch((err) => {
        console.error("Failed to commit cleansing event to ledger", err);
      });
    };

    window.addEventListener('vsip_cleansing_event' as any, handleCleansingEvent as any);
    return () => {
      window.removeEventListener('vsip_cleansing_event' as any, handleCleansingEvent as any);
    };
  }, []);

  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-surface-header shrink-0">
        <History className="w-4 h-4 text-brand-indigo" />
        <h2 className="text-xs font-semibold text-content-primary">Cryptographic Event Ledger</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-content-muted gap-2">
            <Shield className="w-6 h-6 opacity-50" />
            <p className="text-[10px]">Audit trail is empty. Awaiting cleansing actions.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 p-2 rounded bg-surface-canvas/20 border border-white/5 text-xs"
              >
                {event.type === 'manual_map' || event.type === 'auto_map' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-status-success mt-0.5 shrink-0" />
                ) : event.type === 'quarantine' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning mt-0.5 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-brand-indigo mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-content-primary leading-tight">{event.description}</p>
                  <p className="text-[9px] text-content-muted mt-1 font-mono">
                    {new Date(event.timestamp).toISOString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
