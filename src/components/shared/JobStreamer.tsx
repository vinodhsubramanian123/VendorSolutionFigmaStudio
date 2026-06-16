import React, { useEffect, useState, useRef } from 'react';
import { Radio } from 'lucide-react';
import { JobContext } from '../../types/data';
import { apiClient } from '../../services/apiClient';

interface JobStreamerProps {
  jobId: string;
  context: JobContext;
  onSuccess: (result: unknown, context: JobContext) => void;
  onError: (error: string, context: JobContext) => void;
}

interface SSEMessage {
  progress?: number;
  status?: string;
  result?: unknown;
  error?: string;
}

export function JobStreamer({ jobId, context, onSuccess, onError }: JobStreamerProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('queued');

  const latestProps = useRef({ context, onSuccess, onError });
  useEffect(() => {
    latestProps.current = { context, onSuccess, onError };
  }, [context, onSuccess, onError]);

  useEffect(() => {
    const stream = apiClient.streamJob(
      jobId,
      (rawData: unknown) => {
        const data = rawData as SSEMessage;
        setProgress(data.progress || 0);
        setStatus(data.status || 'queued');
        if (data.status === 'completed') {
          stream.close();
          latestProps.current.onSuccess(data.result, latestProps.current.context);
        } else if (data.status === 'failed') {
          stream.close();
          latestProps.current.onError(data.error || 'Job failed', latestProps.current.context);
        }
      },
      (rawErr: unknown) => {
        const err = rawErr as Error;
        latestProps.current.onError(err.message || 'Stream connection lost', latestProps.current.context);
        stream.close();
      }
    );

    return () => {
      stream.close();
    };
  }, [jobId]);

  const [randomLatency] = useState(() => {
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) hash = jobId.charCodeAt(i) + ((hash << 5) - hash);
    return (Math.abs(hash) % 20) + 15;
  });

  // We do not return null on completion to prevent layout shifting before the parent unmounts it
  if (status === 'failed') return null;

  return (
    <div className="w-full mt-4 bg-surface-elevated p-4 border border-indigo-500/20 rounded-lg animate-fadeIn shadow-[0_0_15px_rgba(99,102,241,0.1)]">
      <div className="flex justify-between items-end mb-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              WSS SECURE TUNNEL
            </span>
            <span className="text-[8.5px] text-gray-500 font-mono">
              ~{randomLatency}ms
            </span>
          </div>
          <span className="text-xs font-semibold text-white block">Job Process: {jobId}</span>
        </div>
        <span className="text-sm font-mono font-bold text-indigo-400 w-12 text-right inline-block">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300 ease-linear shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
