import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoreStore } from '../../store/coreStore';
import { tokens } from '../../styles/tokens';
import { Button } from '../shared/Button';
import { StatusBadge } from '../shared/StatusBadge';

export function SolutionManager() {
  const navigate = useNavigate();
  const solutions = useCoreStore(s => s.solutions);
  const setActiveSolution = useCoreStore(s => s.setActiveSolution);

  const handleSelectSolution = (id: string) => {
    setActiveSolution(id);
    navigate('/solution-builder');
  };

  const handleCreateSolution = () => {
    navigate('/ingestion-hub');
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: tokens.colors.text.primary }}>
            Solution Portfolio
          </h1>
          <p className="mt-1" style={{ color: tokens.colors.text.secondary }}>
            Manage and monitor your overarching BOQ projects.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateSolution}>
          + New Solution
        </Button>
      </div>

      {solutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 gap-4 rounded-xl border border-white/5 bg-surface-card">
          <div className="text-xl" style={{ color: tokens.colors.text.secondary }}>
            No solutions found.
          </div>
          <Button variant="secondary" onClick={handleCreateSolution}>
            Upload BOQ to create one
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {solutions.map((sol) => (
            <div
              key={sol.id}
              role="button"
              tabIndex={0}
              className="p-5 flex flex-col gap-4 cursor-pointer hover:ring-2 transition-all rounded-xl border bg-surface-card"
              style={{
                borderColor: tokens.colors.border.subtle,
              }}
              onClick={() => handleSelectSolution(sol.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSolution(sol.id);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                    {sol.name}
                  </h3>
                  <div className="text-sm mt-1 font-mono" style={{ color: tokens.colors.text.tertiary }}>
                    {sol.displayId}
                  </div>
                </div>
                <StatusBadge
                  status={
                    sol.status === 'completed'
                      ? 'resolved'
                      : sol.status === 'parallel-active'
                      ? 'fixing'
                      : 'open'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <div style={{ color: tokens.colors.text.secondary }}>Customer</div>
                  <div className="font-medium" style={{ color: tokens.colors.text.primary }}>{sol.customerName}</div>
                </div>
                <div>
                  <div style={{ color: tokens.colors.text.secondary }}>Vendor Strategy</div>
                  <div className="font-medium" style={{ color: tokens.colors.text.primary }}>{sol.vendor}</div>
                </div>
                <div>
                  <div style={{ color: tokens.colors.text.secondary }}>Configs</div>
                  <div className="font-medium" style={{ color: tokens.colors.text.primary }}>{sol.configCount} Total</div>
                </div>
                <div>
                  <div style={{ color: tokens.colors.text.secondary }}>Created</div>
                  <div className="font-medium" style={{ color: tokens.colors.text.primary }}>
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
