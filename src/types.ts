/**
 * Types for Vendor Solution Intelligence Platform
 */

export type AppView =
  | 'dashboard'
  | 'ingestion-hub'
  | 'live-mission'
  | 'catalog'
  | 'vendor-portal'
  | 'forensic'
  | 'reports'
  | 'cleansing'
  | 'taxonomy'
  | 'solution-builder'
  | 'telemetry'
  | 'documentation'
  | 'premium';

export type UCIDStep =
  | 'boq-intake'
  | 'pre-intelligence'
  | 'solution-design'
  | 'vendor-provisioning'
  | 'post-intelligence'
  | 'comparison'
  | 'snapshot';

export * from './types/data';