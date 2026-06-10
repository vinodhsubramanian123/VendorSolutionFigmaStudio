import React, { useEffect, useState } from 'react';
import { Job, JobContext } from '../../types/data';

interface JobPollerProps {
  jobId: string;
  context: JobContext;
  onSuccess: (result: any, context: JobContext) => void;
  onError: (error: string, context: JobContext) => void;
}

export function JobPoller({ jobId, context, onSuccess, onError }: JobPollerProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('queued');

  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job');
        const data = await res.json() as Job;
        if (active) {
          setProgress(data.progress || 0);
          setStatus(data.status);
          if (data.status === 'completed') {
            clearInterval(interval);
            onSuccess(data.result, context);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            onError(data.error || 'Job failed', context);
          }
        }
      } catch (err: any) {
        if (active) {
          clearInterval(interval);
          onError(err.message, context);
        }
      }
    }, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [jobId, context, onSuccess, onError]);

  if (status === 'completed' || status === 'failed') return null;

  return (
    <div className="w-full mt-4 bg-black/20 p-4 border border-white/10 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-300">Processing Job: {jobId}</span>
        <span className="text-xs font-mono text-indigo-400">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
