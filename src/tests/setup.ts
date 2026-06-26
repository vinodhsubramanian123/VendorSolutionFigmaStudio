import '@testing-library/jest-dom';
import 'vitest-axe/extend-expect';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

// Mock scrollIntoView — not available in JSDOM (used by NLPParser chat scroll)
window.HTMLElement.prototype.scrollIntoView = () => {};

// Extend vitest's expect with axe matchers
expect.extend(matchers);

import { beforeEach } from 'vitest';
import { useCoreStore } from '../store/coreStore';
import { useWorkflowStore } from '../store/workflowStore';
import { useIngestionStore } from '../store/ingestionStore';
import { useAuditStore } from '../store/auditStore';

beforeEach(() => {
  useCoreStore.setState({ ucids: [], vendors: [] });
  useWorkflowStore.setState({ workflows: {} });
  // Set selectedPreset to default literal
  useIngestionStore.setState({ 
    selectedPreset: "hpe-legacy", 
    boqFile: "", 
    boqResponse: null, 
    activeBOMFile: "", 
    bomVerifyResult: null, 
    bomReconResult: null 
  });
  useAuditStore.setState({ logs: [] });
});

// Mock window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver for Recharts
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock HTMLCanvasElement for Recharts
HTMLCanvasElement.prototype.getContext = (() => {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x: number, y: number, w: number, h: number) => ({ data: new Array(w * h * 4) }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  } as unknown as CanvasRenderingContext2D;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock react-virtuoso for testing to render all elements in JSDOM
import React from 'react';
import { vi } from 'vitest';

vi.mock('react-virtuoso', async () => {
  type ItemContentFn = (index: number, item?: unknown) => React.ReactNode;
  return {
    Virtuoso: ({ data, totalCount, itemContent }: Record<string, unknown>) => {
      const items = [];
      if (data && Array.isArray(data)) {
        items.push(...data.map((item: unknown, index: number) => (itemContent as ItemContentFn)(index, item)));
      } else if (typeof totalCount === 'number') {
        for (let i = 0; i < totalCount; i++) {
          items.push((itemContent as ItemContentFn)(i));
        }
      }
      return React.createElement('div', { 'data-testid': 'mock-virtuoso' }, items);
    },
    VirtuosoGrid: ({ data, totalCount, itemContent }: Record<string, unknown>) => {
      const items = [];
      if (data && Array.isArray(data)) {
        items.push(...data.map((item: unknown, index: number) => (itemContent as ItemContentFn)(index, item)));
      } else if (typeof totalCount === 'number') {
        for (let i = 0; i < totalCount; i++) {
          items.push((itemContent as ItemContentFn)(i));
        }
      }
      return React.createElement('div', { 'data-testid': 'mock-virtuoso-grid' }, items);
    }
  };
});

// Polyfill crypto.randomUUID for jsdom
import { randomUUID } from 'crypto';
if (typeof window.crypto === 'undefined') {
  Object.defineProperty(window, 'crypto', {
    value: {
      randomUUID: () => randomUUID()
    }
  });
} else if (typeof window.crypto.randomUUID === 'undefined') {
  window.crypto.randomUUID = () => randomUUID() as ReturnType<typeof crypto.randomUUID>;
}
