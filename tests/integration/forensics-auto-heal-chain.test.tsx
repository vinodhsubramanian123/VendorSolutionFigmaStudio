import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { ForensicView } from '../../src/components/forensics/ForensicView';
import type { ForensicIssue, SourcingRule, LearningEvent, UCID, Vendor, CatalogSKU } from '../../src/types';
import { ToastProvider } from '../../src/components/shared/ToastContext';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('http://localhost:3000/api/issues/auto-heal', () => {
    return HttpResponse.json({
      data: {
        updatedUcid: { id: 'mock-ucid-1', displayId: 'UCID-2026-MOCK', name: 'Mock Mission', solutions: [] },
        newRule: { ruleType: 'substitution', partNumber: '815100-B21', mappedOutput: 'P40424-B21', vendor: 'HPE', status: 'active', isAutoLearned: true, sourceIssueId: 'iss-1' },
        newLearningEvent: { id: 'learn-1', type: 'rule_inferred', action: 'Substituted EOL part', preventedMismatchCount: 1, sourceIssueId: 'iss-1' },
        toastMsg: 'Issue resolved.'
      }
    });
  }),
  http.post('/api/issues/auto-heal', () => {
    return HttpResponse.json({
      data: {
        updatedUcid: { id: 'mock-ucid-1', displayId: 'UCID-2026-MOCK', name: 'Mock Mission', solutions: [] },
        newRule: { ruleType: 'substitution', partNumber: '815100-B21', mappedOutput: 'P40424-B21', vendor: 'HPE', status: 'active', isAutoLearned: true, sourceIssueId: 'iss-1' },
        newLearningEvent: { id: 'learn-1', type: 'rule_inferred', action: 'Substituted EOL part', preventedMismatchCount: 1, sourceIssueId: 'iss-1' },
        toastMsg: 'Issue resolved.'
      }
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); window.localStorage.clear(); });
afterAll(() => server.close());

function TestWrapper() {
  const [forensicIssues, setForensicIssues] = useState<ForensicIssue[]>([
    {
      id: 'iss-1',
      title: 'Legacy EOL Processor Detected',
      description: 'Found obsolete Intel Xeon 6230 CPU in BOM.',
      vendor: 'Intel',
      severity: 'critical',
      status: 'open',
      affectedItems: 1,
      suggestedAction: 'Auto-Align with Sourcing Rule'
    }
  ]);
  const [sourcingRules, setSourcingRules] = useState<SourcingRule[]>([]);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  
  const [ucids, setUcids] = useState<UCID[]>([
    { 
      id: 'mock-ucid-1', 
      displayId: 'UCID-2026-MOCK', 
      name: 'Mock Mission',
      solutions: [
        {
          id: 'sol-1',
          vendorSubmissions: [
            {
              vendor: 'HPE',
              configs: [
                {
                  items: [{ partNumber: '815100-B21' }]
                }
              ]
            }
          ]
        }
      ]
    } as any
  ]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [catalogSkus, setCatalogSkus] = useState<CatalogSKU[]>([]);
  const [activeMissionId, setActiveMissionId] = useState<string | undefined>('mock-ucid-1');

  (window as any).TEST_STATE = { forensicIssues, sourcingRules, learningEvents };

  return (
    <ToastProvider>
      <ForensicView
        forensicIssues={forensicIssues}
        setForensicIssues={setForensicIssues}
        setVendors={setVendors}
        setCatalogSkus={setCatalogSkus}
        ucids={ucids}
        setUcids={setUcids}
        activeMissionId={activeMissionId}
        setActiveMissionId={setActiveMissionId}
        sourcingRules={sourcingRules}
        setSourcingRules={setSourcingRules}
        learningEvents={learningEvents}
        setLearningEvents={setLearningEvents}
      />
    </ToastProvider>
  );
}

describe('03 - Forensics Auto-Heal Chain Integration', () => {
  it('should successfully auto-heal an issue, creating a rule and a learning event', async () => {
    render(<TestWrapper />);

    // Check issue is open
    expect(screen.getByText('Legacy EOL Processor Detected')).toBeInTheDocument();

    // Find and click the Auto-Align (Auto-Heal) button
    const autoHealBtn = screen.getByTestId('btn-auto-align');
    fireEvent.click(autoHealBtn);

    // Click confirm on the clarification modal
    const lockBtn = await screen.findByTestId('btn-lock-intelligence-rule');
    fireEvent.click(lockBtn);

    // Wait for the state to update
    await waitFor(() => {
      const state = (window as any).TEST_STATE;
      
      // 1. Issue should be resolved
      const issue = state.forensicIssues.find((i: ForensicIssue) => i.id === 'iss-1');
      expect(issue.status).toBe('resolved');

      // 2. Sourcing Rule should be created
      expect(state.sourcingRules.length).toBe(1);
      expect(state.sourcingRules[0].status).toBe('active');
      expect(state.sourcingRules[0].isAutoLearned).toBe(true);
      expect(state.sourcingRules[0].sourceIssueId).toBe('iss-1');

      // 3. Learning Event should be logged
      expect(state.learningEvents.length).toBe(1);
      expect(state.learningEvents[0].type).toBe('rule_inferred');
      expect(state.learningEvents[0].preventedMismatchCount).toBeGreaterThanOrEqual(0);
    });
  });
});
