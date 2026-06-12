export interface VendorRequest {
  vendor: 'HPE' | 'Dell' | 'Lenovo' | 'Cisco' | 'Juniper' | 'Ingram';
  action: 'fetchSKU' | 'validateBOM' | 'scrapePortal';
  payload: Record<string, unknown>;
}

export interface VendorResponse {
  success: boolean;
  data?: unknown;
  errorCode?: string;
  evidence?: string[];   // URLs to scraped evidence
  confidence?: number;
}

export interface IVendorPortalAdapter {
  handle(req: VendorRequest): Promise<VendorResponse>;
  healthCheck(): Promise<boolean>;
}
