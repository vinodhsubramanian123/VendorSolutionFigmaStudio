import type { BOMItem } from '../types';

export interface ConfigItem {
  id: string;
  name: string;
  targetUcidId: string;
  vendor: "HPE" | "Dell" | "Cisco";
  totalPrice: number;
  originalPrice: number;
  items: BOMItem[];
}

export interface UcidContainer {
  id: string; // e.g. UCID-2026-1699
  name: string;
  reasoning: string;
  locked: boolean;
  syncStatus?: "Pending" | "Synced" | "Out-of-Sync";
}
