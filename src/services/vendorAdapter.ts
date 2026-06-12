import { IVendorPortalAdapter, VendorRequest, VendorResponse } from './IVendorPortalAdapter';

export class MockVendorAdapter implements IVendorPortalAdapter {
  async handle(req: VendorRequest): Promise<VendorResponse> {
    console.log(`[MockVendorAdapter] Handling ${req.action} for ${req.vendor}`);
    return {
      success: true,
      data: { mockResponse: true, timestamp: new Date().toISOString() },
      confidence: 0.95
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

export class RealVendorAdapter implements IVendorPortalAdapter {
  async handle(req: VendorRequest): Promise<VendorResponse> {
    // In a real application, this would make external HTTP/Playwright calls.
    console.log(`[RealVendorAdapter] Handling ${req.action} for ${req.vendor}`);
    return {
      success: true,
      data: { realResponse: true },
      confidence: 0.98
    };
  }

  async healthCheck(): Promise<boolean> {
    // Ping real portal
    return true;
  }
}

// Factory to switch between mock and real based on environment
export function createVendorAdapter(useMock: boolean): IVendorPortalAdapter {
  return useMock ? new MockVendorAdapter() : new RealVendorAdapter();
}
