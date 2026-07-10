export type CleansingEventType = 
  | 'QUANTITY_UPDATE'
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'SPLIT_CONFIG';

export interface BaseCleansingEvent {
  id: string;
  eventType: CleansingEventType;
  timestamp: string;
  reason: string;
}

export interface QuantityUpdateEvent extends BaseCleansingEvent {
  eventType: 'QUANTITY_UPDATE';
  targetPartNumber: string;
  oldQuantity: number;
  newQuantity: number;
}

export interface AddItemEvent extends BaseCleansingEvent {
  eventType: 'ADD_ITEM';
  partNumber: string;
  name: string;
  quantity: number;
}

export interface RemoveItemEvent extends BaseCleansingEvent {
  eventType: 'REMOVE_ITEM';
  targetPartNumber: string;
}

export interface SplitConfigEvent extends BaseCleansingEvent {
  eventType: 'SPLIT_CONFIG';
  sourceConfigId: string;
  destinationConfigId: string;
  transferredItems: { partNumber: string; quantityToMove: number }[];
}

export type CleansingEvent = 
  | QuantityUpdateEvent 
  | AddItemEvent 
  | RemoveItemEvent 
  | SplitConfigEvent;

// ─── UI Audit Ledger Event (separate from backend domain events above) ─────────
// These are emitted by CleansingView via window.dispatchEvent('vsip_cleansing_event')
// and consumed by CleansingEventLedger.tsx. They capture user-facing actions
// (auto_map, manual_map, quarantine, split) at the UI interaction layer.
export interface CleansingAuditEntry {
  id: string;
  type: 'manual_map' | 'auto_map' | 'quarantine' | 'split';
  description: string;
  timestamp: string;
}
