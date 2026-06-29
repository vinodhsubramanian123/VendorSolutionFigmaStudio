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
