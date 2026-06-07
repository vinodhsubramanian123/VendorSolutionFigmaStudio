import React from 'react';
import { Book, Code, Database, Server, Link as LinkIcon, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export function DocumentationView() {
  return (
    <div className="space-y-6 flex flex-col h-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Book className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">System Documentation</h1>
            <p className="text-xs text-gray-400 tracking-wide mt-1">API Contracts, Endpoints, and Global Schemas</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        
        {/* API Contracts */}
        <section className="bg-[#0b1220] border border-white/5 rounded-xl overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">API Endpoint Contracts</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/boq/ingest</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Workbook Parsing</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Ingests multi-tab sourcing documents and transforms them into parallel alternative designs assigned to a parent UCID.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Payload</h4>
                  <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "fileName": "HPE_PARTNER_QUOTE.xlsx",
  "presetType": "hpe-legacy"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Response</h4>
                  <p className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg">Solution[] assigned to a parent UCID</p>
                </div>
              </div>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/agents/run</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Vendor Crawling</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Spins up headless cloud browsers acting like human users to fetch real-time vendor supply data from non-API legacy supplier sites.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Payload</h4>
                  <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "agentName": "DellPremierPortal",
  "ucidRef": "u1",
  "targetPortalUrl": "https://premier.dell.com",
  "bypassCaptchas": true
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Response</h4>
                  <p className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg">PlaywrightRunResponse (Trailing logs, metrics, extracted items)</p>
                </div>
              </div>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/portfolio/orchestrate</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Hybrid Multi-UCID</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Orchestrates automated API crawling and manual partner portal drops in combination.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Payload</h4>
                  <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "portfolioId": "string",
  "ucids": [
    { "id": "u1", "channel": "manual", "vendor": "HPE" }
  ]
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Response</h4>
                  <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "success": true,
  "transactionId": "string",
  "status": "orchestrating",
  "timestamp": "string"
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/portfolio/upload-manual</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Hybrid Multi-UCID</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Submits manual partner custom match configurations, pausing development milestones and syncing missing allocation slots.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Payload</h4>
                  <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "portfolioId": "string",
  "ucidRef": "string",
  "filename": "string",
  "configsMatchedCount": 0
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Response</h4>
                  <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "success": true,
  "reconciliationStatus": "partial",
  "reconciledPriceUSD": 0,
  "missingSlots": [],
  "integrityScore": 100,
  "message": "string"
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/reconciliation/compare</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Intelligence</span>
              </div>
              <p className="text-xs text-gray-400">Identifies optimal configurations by crossing vendor attributes and detects best potential hybrid scenarios (e.g. combining Chassis from HPE but drives from generic).</p>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/integrations/dispatch</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Synchronization</span>
              </div>
              <p className="text-xs text-gray-400">Locks snapshots and dispatches encrypted payload ledgers direct to enterprise tools via cryptographic HMAC signatures. Implements exponential back-off retries.</p>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-[#00d4a0]">POST /api/taxonomy/check-constraints</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-0.5 rounded">Validation</span>
              </div>
              <p className="text-xs text-gray-400">Evaluates chassisSKU, cpuSKU, ramQuantity, psuWattsCount to assert socket harmony, symmetric memory controller pipelines, and strict thermal envelopes.</p>
            </div>

            <div className="border border-fuchsia-500/20 rounded-lg p-4 bg-black/40 shadow-[0_0_10px_rgba(217,70,239,0.05)]">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="font-mono text-sm text-fuchsia-400">WEBHOOK /callbacks/procurement-status</h3>
                 <span className="text-[10px] uppercase font-bold text-fuchsia-500 tracking-widest bg-fuchsia-500/10 px-2 py-0.5 rounded">Async Event</span>
               </div>
               <p className="text-xs text-gray-400 mb-4">Receives asynchronous push notifications from partner APIs once offline quote generation or manual interventions succeed.</p>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Incoming Payload</h4>
                   <pre className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg overflow-x-auto">
{`{
  "eventId": "evt_9001",
  "type": "quote.generated",
  "data": {
    "ucidRef": "u1",
    "vendorId": "v1",
    "quoteDocumentUrl": "https://...",
    "validUntil": "2026-07-07T00:00:00Z"
  },
  "signature": "sha256=abc123..."
}`}
                   </pre>
                 </div>
                 <div>
                   <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Expected Response</h4>
                   <p className="text-[10px] font-mono text-gray-300 bg-[#070a13] border border-white/5 p-3 rounded-lg">204 No Content</p>
                 </div>
               </div>
            </div>

          </div>
        </section>

        {/* Global Data Models */}
        <section className="bg-[#0b1220] border border-white/5 rounded-xl overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-[#00d4a0]" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Global Core Entities</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <h3 className="font-mono text-sm text-white mb-3">UCID (Unified Config ID)</h3>
              <p className="text-xs text-gray-400 mb-3">The master reference block holding the full lifecycle of a multi-vendor configuration.</p>
              <ul className="text-[10px] font-mono text-gray-400 space-y-1.5">
                <li><span className="text-indigo-400">id:</span> string</li>
                <li><span className="text-indigo-400">displayId:</span> string <span className="text-gray-500">{"// e.g. 'UCID-A'"}</span></li>
                <li><span className="text-indigo-400">name:</span> string</li>
                <li><span className="text-indigo-400">currentStep:</span> UCIDStep</li>
                <li><span className="text-indigo-400">configurations:</span> Solution[] <span className="text-gray-500">{"// Bids/Alternatives"}</span></li>
                <li><span className="text-indigo-400">originalBoqUrl:</span> string?</li>
                <li><span className="text-indigo-400">budgetTarget:</span> number</li>
                <li><span className="text-indigo-400">status:</span> 'draft'|'processing'|'completed'</li>
                <li><span className="text-indigo-400">lastModified:</span> string</li>
              </ul>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <h3 className="font-mono text-sm text-white mb-3">Vendor / Supplier</h3>
              <p className="text-xs text-gray-400 mb-3">Represents external manufacturers, distributors, or legacy pricing systems.</p>
              <ul className="text-[10px] font-mono text-gray-400 space-y-1.5">
                <li><span className="text-[#00d4a0]">id:</span> string</li>
                <li><span className="text-[#00d4a0]">name:</span> string</li>
                <li><span className="text-[#00d4a0]">type:</span> 'manufacturer'|'distributor'|'broker'|'legacy-manual'</li>
                <li><span className="text-[#00d4a0]">apiEndpoint:</span> string?</li>
                <li><span className="text-[#00d4a0]">authType:</span> 'oauth'|'bearer'|'basic'|'playwright'</li>
                <li><span className="text-[#00d4a0]">status:</span> 'connected'|'error'|'pending'|'syncing'</li>
                <li><span className="text-[#00d4a0]">lastSync:</span> string</li>
                <li><span className="text-[#00d4a0]">latencyMs:</span> number?</li>
              </ul>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <h3 className="font-mono text-sm text-white mb-3">ForensicIssue</h3>
              <p className="text-xs text-gray-400 mb-3">Diagnostic report mapping pricing anomalies, lifecycle end-of-life (EOL), or missing/malformed SKUs.</p>
              <ul className="text-[10px] font-mono text-gray-400 space-y-1.5">
                <li><span className="text-[#ff9b36]">id:</span> string</li>
                <li><span className="text-[#ff9b36]">severity:</span> 'critical'|'warning'|'info'</li>
                <li><span className="text-[#ff9b36]">type:</span> 'eol-hardware'|'margin-overage'|'corrupt-sku'|'missing-part'</li>
                <li><span className="text-[#ff9b36]">description:</span> string</li>
                <li><span className="text-[#ff9b36]">affectedUcid:</span> string?</li>
                <li><span className="text-[#ff9b36]">affectedSku:</span> string?</li>
                <li><span className="text-[#ff9b36]">suggestedRemediation:</span> string?</li>
                <li><span className="text-[#ff9b36]">status:</span> 'open'|'resolved'|'ignored'</li>
              </ul>
            </div>

            <div className="border border-white/5 rounded-lg p-4 bg-black/40">
              <h3 className="font-mono text-sm text-white mb-3">CatalogSKU</h3>
              <p className="text-xs text-gray-400 mb-3">Centralized, normalized source of truth for component configurations and cross-vendor mappings.</p>
              <ul className="text-[10px] font-mono text-gray-400 space-y-1.5">
                <li><span className="text-indigo-400">id:</span> string</li>
                <li><span className="text-indigo-400">partNumber:</span> string <span className="text-gray-500">{"// e.g. 'P17086-B21'"}</span></li>
                <li><span className="text-indigo-400">description:</span> string</li>
                <li><span className="text-indigo-400">category:</span> string</li>
                <li><span className="text-indigo-400">baseUSD:</span> number</li>
                <li><span className="text-indigo-400">vendorId:</span> string</li>
                <li><span className="text-indigo-400">requiresLicense:</span> boolean</li>
                <li><span className="text-indigo-400">eolDate:</span> string?</li>
                <li><span className="text-indigo-400">relatedSkus:</span> string[] <span className="text-gray-500">{"// dependencies"}</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Mock API Response Registry */}
        <section className="bg-[#0b1220] border border-white/5 rounded-xl overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Mock API Response Registry</h2>
          </div>
          <p className="text-xs text-gray-400 mb-6">These defined mock output sets represent the strict data structures we anticipate returning from RESTful endpoints to validate against UI types before actual runtime execution.</p>

          <div className="space-y-4 text-xs font-mono">
            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-gray-300 flex justify-between">
                <span>GET /api/v1/vendors</span>
                <span className="text-[#00d4a0]">200 OK</span>
              </div>
              <pre className="p-4 text-gray-400 text-[10px] overflow-x-auto">
{`{
  "data": [
    {
      "id": "v1",
      "name": "Hewlett Packard Enterprise",
      "shortName": "HPE",
      "type": "manufacturer",
      "status": "connected",
      "catalogItems": 240,
      "apiHealth": 98.4
    }
  ],
  "metadata": {
    "totalCount": 1,
    "currentPage": 1,
    "totalPages": 1,
    "hasNextPage": false
  }
}`}
              </pre>
            </div>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-gray-300 flex justify-between">
                <span>GET /api/v1/forensics/scan</span>
                <span className="text-[#00d4a0]">200 OK</span>
              </div>
              <pre className="p-4 text-gray-400 text-[10px] overflow-x-auto">
{`{
  "issues": [
    {
      "id": "FI-991",
      "severity": "critical",
      "type": "eol-hardware",
      "description": "Processor SKU reached EOL matching Intel Xeons",
      "affectedSku": "Intel-X1",
      "status": "open"
    }
  ]
}`}
              </pre>
            </div>
            
            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-gray-300 flex justify-between">
                <span>GET /api/v1/inventory/skus?vendor=v1</span>
                <span className="text-[#00d4a0]">200 OK</span>
              </div>
              <pre className="p-4 text-gray-400 text-[10px] overflow-x-auto">
{`{
  "data": [
    {
      "id": "s1",
      "partNumber": "DL380-GEN11-BASE",
      "description": "ProLiant DL380 Gen11 8SFF Base",
      "category": "Chassis",
      "baseUSD": 2150,
      "vendorId": "v1"
    }
  ],
  "metadata": {
    "totalCount": 1,
    "currentPage": 1,
    "totalPages": 1,
    "hasNextPage": false
  }
}`}
              </pre>
            </div>

            {/* Edge Cases */}
            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-gray-300 flex justify-between">
                <span>GET /api/v1/inventory/skus?vendor=unknown</span>
                <span className="text-[#00d4a0]">200 OK (Empty State)</span>
              </div>
              <pre className="p-4 text-gray-400 text-[10px] overflow-x-auto">
{`{
  "data": [],
  "metadata": {
    "totalCount": 0,
    "currentPage": 1,
    "totalPages": 0,
    "hasNextPage": false
  }
}`}
              </pre>
            </div>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-gray-300 flex justify-between">
                <span>POST /api/portfolio/orchestrate</span>
                <span className="text-amber-400">422 Unprocessable Entity (Validation Error)</span>
              </div>
              <pre className="p-4 text-gray-400 text-[10px] overflow-x-auto">
{`{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Payload schema validation failed at node dispatch.",
    "details": [
      {
        "field": "budgetCurrency",
        "issue": "Missing required field. Anticipated 'USD' | 'EUR' | 'GBP'."
      },
      {
        "field": "configurations",
        "issue": "Type mismatch. Expected Array of BoQPayload[] structs."
      }
    ]
  }
}`}
              </pre>
            </div>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-gray-300 flex justify-between">
                <span>POST /api/boq/ingest/batch</span>
                <span className="text-blue-400">207 Multi-Status (Partial Success)</span>
              </div>
              <pre className="p-4 text-gray-400 text-[10px] overflow-x-auto">
{`{
  "summary": {
    "totalProcessed": 3,
    "successCount": 2,
    "failureCount": 1
  },
  "results": [
    {
      "ucidRef": "u1",
      "status": "success",
      "message": "Successfully parsed and identified 24 items."
    },
    {
      "ucidRef": "u2",
      "status": "success",
      "message": "Successfully parsed and identified 12 items."
    },
    {
      "ucidRef": "u3",
      "status": "failed",
      "message": "Malformed document structure. Could not locate 'Part Number' column indicator."
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </section>
        {/* API Gap Analysis Module */}
        <section className="bg-[#0b1220] border border-amber-500/20 rounded-xl overflow-hidden p-6 mt-6 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">API Gap Analysis & Diff Report</h2>
          </div>
          <p className="text-xs text-gray-400 mb-6">Cross-referencing frontend data structures with standard external procurement API specification definitions to highlight missing or mismatched data fields, ensuring seamless integration.</p>

          <div className="space-y-4 text-xs font-mono">
            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                <span className="text-gray-300 font-bold">UCID Schema</span>
                <span className="text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 text-[9px] uppercase tracking-widest">3 GAPS DETECTED</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-2 mb-2">
                  <span>Current Frontend Model</span>
                  <span>vs Standard API Spec</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-red-400">budgetCurrency (Missing)</span>
                  <span className="text-emerald-400 block">Required: 'USD' | 'EUR' | 'GBP'</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-red-400">ownerEmail (Missing)</span>
                  <span className="text-emerald-400 block">Required: string (RFC 5322)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400">configurations (Type Mismatch)</span>
                  <span className="text-emerald-400 block">Expected Array of BoQPayload[] (Not Solution[])</span>
                </div>
              </div>
            </div>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                <span className="text-gray-300 font-bold">Vendor Schema</span>
                <span className="text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 text-[9px] uppercase tracking-widest">2 GAPS DETECTED</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-2 mb-2">
                  <span>Current Frontend Model</span>
                  <span>vs Standard API Spec</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400">authType (Incomplete Enum)</span>
                  <span className="text-emerald-400 block">Missing: 'mutual-tls', 'api-key-header'</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-red-400">rateLimitQuota (Missing)</span>
                  <span className="text-emerald-400 block">Required: integer (requests/minute)</span>
                </div>
              </div>
            </div>
            
            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/60">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                <span className="text-gray-300 font-bold">CatalogSKU Schema</span>
                <span className="text-[#00d4a0] px-2 py-0.5 bg-[#00d4a0]/10 rounded border border-[#00d4a0]/20 text-[9px] uppercase tracking-widest">0 GAPS DETECTED</span>
              </div>
              <div className="p-4 flex items-center gap-2 text-gray-400 text-[10px]">
                <CheckCircle className="w-4 h-4 text-[#00d4a0]" /> 
                Frontend model perfectly mirrors anticipated provider payload requirements.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
