# VSIP UI Testing Specification
## Complete Test Coverage Contract — For Agent Implementation

---

## 1. Agent Instructions

This document is the complete, authoritative testing specification for VSIP. Implement every category in this document. Do not invent patterns outside this spec. Do not install libraries not listed below. Before generating any test file, resolve all placeholder component names to their actual counterparts in the VSIP source tree.

---

## 2. Project Context

| Field | Value |
|---|---|
| **Project** | VSIP — Vendor Solutions Intelligence Platform |
| **Domain** | Multi-vendor BOQ/BOM engineering (HPE, Dell, Lenovo, Cisco, Juniper) |
| **Stack** | React 19 + TypeScript + Vite + Tailwind CSS (see AGENTS.md §5.4 for React 19 ESM/CJS compatibility notes) |
| **Unit / Component Runner** | Vitest |
| **Component Testing** | React Testing Library (RTL) |
| **API Mocking** | MSW v2 (Mock Service Worker) |
| **E2E / Visual** | Playwright |
| **Schema Validation** | Zod |
| **State Pattern** | React Context + custom hooks — **do NOT scaffold XState; it is not in the codebase** |
| **Current Phase** | UI freeze — no live backend exists; MSW simulates all API responses |
| **Excluded Scope** | i18n, auth, security, internationalisation |
| **Codebase Governance** | Internal AGENTS.md spec — architectural constraints must be validated in tests |

---

## 3. Test Pyramid Target Ratios

| Layer | Target Share | Tools |
|---|---|---|
| Unit + Component | 50% | Vitest + RTL |
| Integration + MSW-backed | 35% | RTL + MSW |
| E2E / Visual / Playwright | 15% | Playwright |

Generate test files respecting these ratios. Do not produce a flat, evenly distributed suite.

---

## 4. Component Name Notice

All component names in the examples below (e.g., `CatalogAddForm`, `BOQBuilder`, `CatalogView`, `TaxonomyTree`) are **illustrative placeholders only**. Before generating test files, map every placeholder to its actual filename and path in the VSIP source tree. Do not create test files for components that do not exist in source.

---

## 5. Test Categories

---

### Category 1 — Unit Tests
**Purpose**: Test pure logic functions in total isolation — no rendering, no DOM, no network.
**Tool**: Vitest
**Target share**: Part of the 50% unit+component allocation
**Priority focus areas for VSIP**:
- `matchesDeepPath` — must cover null input, empty string, deeply nested path, and boundary conditions
- Currency and price formatting utilities
- BOQ total/subtotal calculation functions
- SKU validation and format checking logic
- Vendor-specific data normalisation functions

```ts
// utils/matchesDeepPath.test.ts
test('returns false gracefully on null input', () => {
  expect(matchesDeepPath(null, 'server.compute')).toBe(false);
});

test('returns false on empty path string', () => {
  expect(matchesDeepPath({ server: { compute: true } }, '')).toBe(false);
});

test('correctly matches a deeply nested path', () => {
  expect(matchesDeepPath({ server: { compute: { cpu: true } } }, 'server.compute.cpu')).toBe(true);
});

// utils/formatCurrency.test.ts
test('formats INR correctly with Indian comma grouping', () => {
  expect(formatCurrency(150000, 'INR')).toBe('₹1,50,000');
});

// utils/boqCalculations.test.ts
test('calculates BOQ line total correctly from qty and unit price', () => {
  expect(calculateLineTotal({ qty: 3, unitPrice: 5000 })).toBe(15000);
});

test('returns zero total for empty line items array', () => {
  expect(calculateBOQTotal([])).toBe(0);
});
```

---

### Category 2 — Component Tests
**Purpose**: Render a single component in isolation, simulate user interaction, assert DOM output.
**Tool**: RTL + Vitest
**Target share**: Part of the 50% unit+component allocation

```tsx
// CatalogAddForm.test.tsx
test('submit button is disabled when required fields are empty', () => {
  render(<CatalogAddForm />);
  expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
});

test('shows validation error on invalid SKU format', () => {
  render(<CatalogAddForm />);
  fireEvent.change(screen.getByLabelText('SKU'), { target: { value: '@@invalid' } });
  fireEvent.blur(screen.getByLabelText('SKU'));
  expect(screen.getByText(/invalid sku/i)).toBeInTheDocument();
});

test('submit button enables when all required fields are populated', () => {
  render(<CatalogAddForm />);
  fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'HPE-P12345-B21' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test item' } });
  expect(screen.getByRole('button', { name: /add/i })).not.toBeDisabled();
});
```

---

### Category 3 — Integration Tests (MSW-backed)
**Purpose**: Test full feature flows — multiple components + state + mock API responses working together end to end.
**Tool**: RTL + MSW v2
**Target share**: Part of the 35% integration allocation

```tsx
// BOQBuilder.integration.test.tsx
test('adding a line item updates the BOQ total correctly', async () => {
  server.use(
    http.post('/api/boq/items', () =>
      HttpResponse.json({ id: 'X1', qty: 2, unitPrice: 5000 })
    )
  );
  render(<BOQBuilder />);
  fireEvent.click(screen.getByText('Add Item'));
  await screen.findByText('₹10,000');
});

test('removing a line item decrements the BOQ total', async () => {
  server.use(
    http.delete('/api/boq/items/:id', () => HttpResponse.json({ success: true }))
  );
  render(<BOQBuilder />);
  fireEvent.click(screen.getByTestId('remove-item-X1'));
  await screen.findByText('₹0');
});
```

---

### Category 4 — Visual Regression / Screenshot Diffing
**Purpose**: Pixel-compare every approved UI state on each PR to catch unintended design drift.
**Tool**: Playwright `toHaveScreenshot()`
**Target share**: Part of the 15% E2E/visual allocation
**Gate**: Run on every PR before merge

```ts
// visual/boq.visual.test.ts
test('BOQ view matches approved snapshot', async ({ page }) => {
  await page.goto('/boq');
  await expect(page).toHaveScreenshot('boq-default.png');
});

test('catalog view matches approved snapshot', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page).toHaveScreenshot('catalog-default.png');
});
```

> Note: Do NOT scaffold Storybook or Chromatic unless Storybook is already configured in the project. If Storybook is absent, use Playwright screenshots only.

---

### Category 5 — Responsive Breakpoint Tests
**Purpose**: Assert layout correctness at each Tailwind breakpoint. Critical for dense BOQ/BOM tables which are at high risk of breaking on narrow viewports.
**Tool**: Playwright
**Target share**: Part of the 15% E2E/visual allocation
**Tailwind breakpoints to cover**: `sm` (375px), `md` (768px), `lg` (1024px), `xl` (1280px)

```ts
test('BOQ table collapses to card view at sm breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/boq');
  await expect(page.locator('.boq-card-row')).toBeVisible();
  await expect(page.locator('table')).not.toBeVisible();
});

test('BOQ table is fully visible at lg breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/boq');
  await expect(page.locator('table')).toBeVisible();
});
```

---

### Category 6 — State Lifecycle Tests (Loading / Empty / Error)
**Purpose**: Every async view must be explicitly tested in all three non-success states. This was confirmed missing in the prior audit — tests were visibility-only with zero lifecycle assertions.
**Tool**: RTL + MSW v2
**Target share**: Part of the 35% integration allocation
**Mandatory for every async view**: Loading state, Empty state, Error state

```tsx
// CatalogView.lifecycle.test.tsx

// Loading state — handler never resolves
test('renders skeleton loader while catalog is loading', () => {
  server.use(http.get('/api/catalog', () => new Promise(() => {})));
  render(<CatalogView />);
  expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
});

// Empty state
test('renders empty state message when catalog returns no items', async () => {
  server.use(http.get('/api/catalog', () => HttpResponse.json([])));
  render(<CatalogView />);
  await screen.findByText('No items found');
});

// Error state
test('renders error message on API 500', async () => {
  server.use(http.get('/api/catalog', () => new HttpResponse(null, { status: 500 })));
  render(<CatalogView />);
  await screen.findByText(/something went wrong/i);
});
```

---

### Category 7 — UCID Pipeline Step / Workflow State Tests
**Purpose**: Validate every step transition in the BOQ/BOM UCID pipeline — legal moves succeed, illegal moves are blocked.
**Tool**: RTL + custom hook testing utilities (react-hooks-testing-library or `renderHook` from RTL)
**Important**: VSIP manages pipeline state via React Context + custom hooks. Do NOT use XState or scaffold XState test utilities — XState is not in this codebase.

```tsx
// hooks/useUCIDPipeline.test.tsx
test('cannot transition to Step 4 without completing Step 2', () => {
  const { result } = renderHook(() => useUCIDPipeline());
  act(() => result.current.goToStep(4));
  expect(result.current.currentStep).toBe(1); // blocked, stays at step 1
});

test('Step 2 → Step 3 transitions correctly after valid payload', () => {
  const { result } = renderHook(() => useUCIDPipeline());
  act(() => result.current.completeStep(1));
  act(() => result.current.submitStep(2, validStep2Payload));
  expect(result.current.currentStep).toBe(3);
});

test('pipeline resets to Step 1 on explicit reset call', () => {
  const { result } = renderHook(() => useUCIDPipeline());
  act(() => result.current.completeStep(1));
  act(() => result.current.reset());
  expect(result.current.currentStep).toBe(1);
});
```

---

### Category 8 — MSW Handler Fidelity / Schema Contract Tests
**Purpose**: Assert that MSW mock response shapes exactly mirror the real backend API contract, validated against Zod schemas. This was confirmed broken in the prior audit — the Zod diagnostic suite was never activated.
**Tool**: Zod + fetch in Vitest
**Target share**: Part of the 35% integration allocation

```ts
// mocks/handlers.contract.test.ts
test('MSW catalog response matches CatalogSKU Zod schema', async () => {
  const res = await fetch('/api/catalog');
  const data = await res.json();
  const result = CatalogSKUArraySchema.safeParse(data);
  expect(result.success).toBe(true);
});

test('MSW BOQ line item response matches BOQLineItemSchema', async () => {
  const res = await fetch('/api/boq/items/X1');
  const data = await res.json();
  const result = BOQLineItemSchema.safeParse(data);
  expect(result.success).toBe(true);
});
```

---

### Category 9 — Payload Integrity Tests
**Purpose**: Assert the exact data shape the UI sends to the API at each step boundary — not just that a request was made, but that the payload structure and field values are correct.
**Tool**: MSW request interceptor + Vitest
**Target share**: Part of the 35% integration allocation

```tsx
// BOQBuilder.payload.test.tsx
test('BOQ submit sends correct payload structure to /api/boq', async () => {
  let captured: unknown;
  server.use(
    http.post('/api/boq', async ({ request }) => {
      captured = await request.json();
      return HttpResponse.json({ success: true });
    })
  );
  render(<BOQBuilder />);
  // ... trigger form fill and submit
  fireEvent.click(screen.getByText('Submit BOQ'));
  await waitFor(() => {
    expect(captured).toMatchObject({
      ucid: expect.any(String),
      lineItems: expect.any(Array),
      vendor: expect.any(String),
      totalValue: expect.any(Number),
    });
  });
});
```

---

### Category 10 — Resilience / Network Failure Tests
**Purpose**: Verify the UI handles offline, 503, and timeout scenarios gracefully — toast notifications fire and UI state rolls back cleanly. Rollback was a confirmed broken path in the prior audit.
**Tool**: RTL + MSW v2
**Target share**: Part of the 35% integration allocation

```tsx
// BOQBuilder.resilience.test.tsx
test('shows error toast and reverts row on 503 during item add', async () => {
  server.use(
    http.post('/api/boq/items', () => new HttpResponse(null, { status: 503 }))
  );
  render(<BOQBuilder />);
  fireEvent.click(screen.getByText('Add Item'));
  await screen.findByText(/failed to add item/i); // toast fires
  expect(screen.queryByTestId('new-row')).not.toBeInTheDocument(); // rolled back
});

test('shows error toast on network timeout during catalog fetch', async () => {
  server.use(http.get('/api/catalog', () => new Promise(() => {}))); // never resolves
  render(<CatalogView />);
  // Advance timers past timeout threshold
  act(() => jest.advanceTimersByTime(10000));
  await screen.findByText(/request timed out/i);
});
```

---

### Category 11 — Accessibility (ARIA) Tests
**Purpose**: Catch missing roles, broken labels, focus trap failures, and ARIA violations across all major views.
**Tool**: jest-axe + RTL
**Target share**: Part of the 50% unit+component allocation

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// CatalogView.a11y.test.tsx
test('CatalogView has no accessibility violations', async () => {
  const { container } = render(<CatalogView />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// BOQBuilder.a11y.test.tsx
test('BOQBuilder has no accessibility violations', async () => {
  const { container } = render(<BOQBuilder />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### Category 12 — Render Count / Performance Tests
**Purpose**: Verify that `React.memo` and `useCallback` wrappers actually prevent excess re-renders in the taxonomy tree and heavy BOQ views. The prior audit confirmed the memoization strategy was being defeated by unstable reference patterns.
**Tool**: RTL + Jest spy
**Target share**: Part of the 50% unit+component allocation

```tsx
// TaxonomyTree.performance.test.tsx
test('TaxonomyTree does not re-render when unrelated state changes', () => {
  const renderSpy = jest.fn();
  const Monitored = React.memo(() => {
    renderSpy();
    return <TaxonomyTree />;
  });
  const { rerender } = render(<Monitored />);
  rerender(<Monitored />); // same props
  expect(renderSpy).toHaveBeenCalledTimes(1); // must not be 2
});

test('CatalogList does not re-render on BOQ state change', () => {
  const renderSpy = jest.fn();
  const Monitored = React.memo(() => {
    renderSpy();
    return <CatalogList />;
  });
  const { rerender } = render(
    <AppStateProvider>
      <Monitored />
    </AppStateProvider>
  );
  // Trigger BOQ-related state change
  act(() => boqDispatch({ type: 'ADD_ITEM', payload: mockItem }));
  expect(renderSpy).toHaveBeenCalledTimes(1);
});
```

---

### Category 13 — Optimistic UI Rollback Tests
**Purpose**: Verify that any row, item, or state added optimistically is cleanly removed when the API call fails. This was a confirmed broken path in the prior audit.
**Tool**: RTL + MSW v2
**Target share**: Part of the 35% integration allocation

```tsx
// BOQBuilder.optimistic.test.tsx
test('optimistically added row disappears if API returns 500', async () => {
  server.use(
    http.post('/api/boq/items', () => new HttpResponse(null, { status: 500 }))
  );
  render(<BOQBuilder />);
  fireEvent.click(screen.getByText('Add Item'));
  // Row appears optimistically first
  expect(screen.getByTestId('pending-row')).toBeInTheDocument();
  // Then disappears after failure response
  await waitForElementToBeRemoved(() => screen.queryByTestId('pending-row'));
});

test('optimistically updated quantity reverts to original on failure', async () => {
  server.use(
    http.patch('/api/boq/items/:id', () => new HttpResponse(null, { status: 500 }))
  );
  render(<BOQBuilder />);
  fireEvent.change(screen.getByTestId('qty-input-X1'), { target: { value: '99' } });
  fireEvent.blur(screen.getByTestId('qty-input-X1'));
  await waitFor(() => {
    expect(screen.getByTestId('qty-input-X1')).toHaveValue('1'); // reverted
  });
});
```

---

### Category 14 — Unsaved Changes Guard Tests
**Purpose**: Navigating away from a dirty form (mid-edit) must be blocked with a confirmation prompt.
**Tool**: RTL + MemoryRouter
**Target share**: Part of the 50% unit+component allocation

```tsx
// BOQLineItemEdit.guard.test.tsx
test('blocks navigation when form has unsaved changes', async () => {
  render(
    <MemoryRouter initialEntries={['/boq/edit/X1']}>
      <BOQLineItemEdit />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '99' } });
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
});

test('allows navigation when form is clean', async () => {
  render(
    <MemoryRouter initialEntries={['/boq/edit/X1']}>
      <BOQLineItemEdit />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText('Back'));
  expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
});
```

---

### Category 15 — Deep-Link / URL State Tests
**Purpose**: Direct URL access to a filtered or step-specific view must load correctly without requiring prior navigation.
**Tool**: RTL + MemoryRouter
**Target share**: Part of the 50% unit+component allocation

```tsx
// routing/deeplink.test.tsx
test('navigating directly to /boq?ucid=XYZ loads correct context', async () => {
  render(<App />, { wrapper: ({ children }) => (
    <MemoryRouter initialEntries={['/boq?ucid=XYZ']}>{children}</MemoryRouter>
  )});
  await screen.findByText('XYZ');
});

test('navigating directly to /catalog?vendor=HPE pre-filters the view', async () => {
  render(<App />, { wrapper: ({ children }) => (
    <MemoryRouter initialEntries={['/catalog?vendor=HPE']}>{children}</MemoryRouter>
  )});
  await screen.findByText('HPE');
  expect(screen.queryByText('Dell')).not.toBeInTheDocument();
});
```

---

### Category 16 — Multi-Vendor BOQ Calculation Tests
**Purpose**: VSIP's core domain complexity is mixed-vendor pricing — HPE, Dell, Lenovo, Cisco, and Juniper line items on a single BOQ, each with different discount structures and unit price logic. This must be tested explicitly as a domain-specific category.
**Tool**: Vitest (pure logic) + RTL + MSW (integration)
**Target share**: Part of the 35% integration allocation

```ts
// domain/multiVendorBOQ.test.ts

test('correctly totals a mixed HPE + Dell + Cisco BOQ', () => {
  const lineItems = [
    { vendor: 'HPE',   sku: 'P12345-B21', qty: 2, unitPrice: 80000 },
    { vendor: 'Dell',  sku: 'AA123456',   qty: 1, unitPrice: 65000 },
    { vendor: 'Cisco', sku: 'SFP-10G-SR', qty: 4, unitPrice: 12000 },
  ];
  expect(calculateBOQTotal(lineItems)).toBe(273000);
});

test('applies vendor-specific discount correctly to HPE line item', () => {
  const item = { vendor: 'HPE', unitPrice: 100000, discountPct: 15 };
  expect(applyVendorDiscount(item)).toBe(85000);
});

test('does not cross-apply HPE discount to Dell line item in same BOQ', () => {
  const boq = [
    { vendor: 'HPE',  unitPrice: 100000, discountPct: 15 },
    { vendor: 'Dell', unitPrice: 100000, discountPct: 0  },
  ];
  const totals = calculateVendorSubtotals(boq);
  expect(totals.HPE).toBe(85000);
  expect(totals.Dell).toBe(100000);
});

test('renders correct per-vendor subtotals in BOQ summary view', async () => {
  server.use(
    http.get('/api/boq/summary', () =>
      HttpResponse.json({
        lineItems: [
          { vendor: 'HPE',  total: 85000 },
          { vendor: 'Dell', total: 100000 },
        ]
      })
    )
  );
  render(<BOQSummaryView />);
  await screen.findByText('HPE: ₹85,000');
  await screen.findByText('Dell: ₹1,00,000');
});
```

---

### Category 17 — AGENTS.md Architectural Compliance Tests
**Purpose**: VSIP is governed by an internal AGENTS.md specification. These tests enforce that architectural constraints are not violated — wrong libraries, missing context wiring, bypassed service layers.
**Tool**: Vitest + RTL
**Target share**: Part of the 50% unit+component allocation
**Important**: Read the actual AGENTS.md in the project root before generating these tests. The constraints below are known examples — add any additional constraints found in AGENTS.md.

```tsx
// compliance/agents-spec.test.tsx

// ToastContext wiring — confirmed missing in prior audit
test('ToastContext is wired and toast fires correctly on error', async () => {
  server.use(http.post('/api/boq/items', () => new HttpResponse(null, { status: 500 })));
  render(
    <ToastProvider>
      <BOQBuilder />
    </ToastProvider>
  );
  fireEvent.click(screen.getByText('Add Item'));
  await screen.findByRole('alert'); // toast element
});

// Virtualization library — AGENTS.md specifies the correct library
// Do NOT use an alternate virtualization library; assert the correct one is in use
test('CatalogList uses the AGENTS.md-specified virtualization library', () => {
  render(<CatalogList items={generateLargeItemSet(500)} />);
  // Assert virtualised container is present, not 500 DOM nodes
  expect(screen.getAllByTestId('catalog-row').length).toBeLessThan(50);
});

// No direct API calls bypassing service layer
test('BOQBuilder does not call fetch() directly — routes through BOQService', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch');
  render(<BOQBuilder />);
  fireEvent.click(screen.getByText('Add Item'));
  await waitFor(() => {
    // fetch should not have been called directly from the component
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

---

### Category 18 — Mutation Testing (Stryker)
**Purpose**: Validate that the test suite itself is meaningful — not visibility-only. Stryker injects deliberate bugs (mutations) into source code and verifies that at least one test fails per mutation. This is mandatory given the prior audit finding that the entire test suite had zero state transition assertions.
**Tool**: Stryker Mutator for Vitest
**When to run**: Not on every commit — run per sprint or before major releases
**Minimum mutation score target**: 70%

**Setup**:
```json
// stryker.config.json
{
  "testRunner": "vitest",
  "mutate": [
    "src/utils/**/*.ts",
    "src/hooks/**/*.ts",
    "src/domain/**/*.ts"
  ],
  "thresholds": {
    "high": 80,
    "low": 70,
    "break": 60
  }
}
```

**Priority mutation targets for VSIP**:
- `matchesDeepPath` — the inverted filter logic bug was a classic mutation-detectable defect
- `calculateBOQTotal` and all price calculation utilities
- UCID pipeline step transition guards
- Zod schema validators

---

### Category 19 — Property-Based Tests (fast-check)
**Purpose**: Automatically generate hundreds of randomised inputs to find edge cases that hand-written tests miss. Particularly valuable for VSIP's math-heavy BOQ calculation logic and the previously buggy `matchesDeepPath` function.
**Tool**: fast-check + Vitest

```ts
// utils/matchesDeepPath.property.test.ts
import * as fc from 'fast-check';

test('matchesDeepPath never throws — always returns boolean', () => {
  fc.assert(
    fc.property(fc.anything(), fc.string(), (input, path) => {
      const result = matchesDeepPath(input, path);
      return typeof result === 'boolean';
    })
  );
});

// domain/boqCalculations.property.test.ts
test('BOQ total is always >= sum of individual line totals', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          qty: fc.nat({ max: 1000 }),
          unitPrice: fc.nat({ max: 1000000 }),
        }),
        { minLength: 1 }
      ),
      (lineItems) => {
        const total = calculateBOQTotal(lineItems);
        const manualSum = lineItems.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
        return total === manualSum;
      }
    )
  );
});

test('applyVendorDiscount never returns a value above original price', () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 1000000 }),
      fc.integer({ min: 0, max: 100 }),
      (unitPrice, discountPct) => {
        const result = applyVendorDiscount({ unitPrice, discountPct });
        return result <= unitPrice;
      }
    )
  );
});
```

---

## 6. Summary Table

| # | Category | Tool | Layer | Phase |
|---|---|---|---|---|
| 1 | Unit tests — pure logic functions | Vitest | Unit | Dev |
| 2 | Component tests — render + interaction | RTL + Vitest | Component | Dev |
| 3 | Integration tests — multi-component + MSW | RTL + MSW | Integration | Dev |
| 4 | Visual regression / screenshot diffing | Playwright | E2E | PR gate |
| 5 | Responsive breakpoint tests | Playwright | E2E | PR gate |
| 6 | State lifecycle — loading / empty / error | RTL + MSW | Integration | Dev |
| 7 | UCID pipeline step / workflow state | RTL + renderHook | Unit / Integration | Dev |
| 8 | MSW handler fidelity — Zod schema contracts | Zod + fetch | Integration | Dev |
| 9 | Payload integrity — outbound request shape | MSW intercept | Integration | Dev |
| 10 | Resilience — 503 / timeout / offline | RTL + MSW | Integration | Dev |
| 11 | Accessibility — ARIA violations | jest-axe + RTL | Component | Dev |
| 12 | Render count / memoization performance | RTL + Jest spy | Component | Dev |
| 13 | Optimistic UI rollback | RTL + MSW | Integration | Dev |
| 14 | Unsaved changes guard | RTL + MemoryRouter | Component | Dev |
| 15 | Deep-link / URL state | RTL + MemoryRouter | Unit / Component | Dev |
| 16 | Multi-vendor BOQ calculation logic | Vitest + RTL + MSW | Unit / Integration | Dev |
| 17 | AGENTS.md architectural compliance | RTL + Vitest | Component | Dev |
| 18 | Mutation testing — suite validity | Stryker (Vitest) | Meta | Per sprint |
| 19 | Property-based tests — edge case generation | fast-check + Vitest | Unit | Dev |

---

## 7. Required Libraries

Ensure the following are installed before generating test files:

```json
{
  "devDependencies": {
    "vitest": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@testing-library/jest-dom": "latest",
    "msw": "^2.0.0",
    "jest-axe": "latest",
    "fast-check": "latest",
    "@stryker-mutator/core": "latest",
    "@stryker-mutator/vitest-runner": "latest",
    "playwright": "latest",
    "@playwright/test": "latest"
  }
}
```

---

## 8. Critical Constraints for Agent

1. **Do NOT scaffold XState** — state is managed via React Context + custom hooks only
2. **Do NOT install Chromatic or Storybook** unless already present in the project
3. **Resolve all component names** against the actual source tree before generating files
4. **Activate the Zod diagnostic suite** — it exists in the codebase but was never wired up
5. **Read AGENTS.md** in the project root before generating Category 17 tests — add all constraints found there
6. **Respect the test pyramid ratios** — 50% unit+component, 35% integration, 15% E2E
7. **Category 18 (Stryker) is a separate run** — do not include it in the main CI pipeline; document as a separate npm script
8. **All MSW handlers must use MSW v2 syntax** — `http.get`, `http.post`, `HttpResponse` — not the legacy `rest.get` v1 syntax
