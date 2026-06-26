import type { UCID } from '../types';
import { logger } from '../utils/logger';

export interface SchedulerTask {
  id: string;
  ucidRef: string;
  action: 'process_boq' | 'sync_vendors' | 'generate_solutions';
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class UCIDScheduler {
  private tasks: SchedulerTask[] = [];

  // Stub for initiating the background processing of a newly uploaded UCID
  scheduleProcessing(ucid: UCID) {
    logger.info(`[UCIDScheduler] Scheduling workflow for UCID ${ucid.id}`);
    const task: SchedulerTask = {
      id: `task-${crypto.randomUUID()}`,
      ucidRef: ucid.id,
      action: 'process_boq',
      status: 'pending'
    };
    this.tasks.push(task);
    return task;
  }

  // Stub for getting current running tasks
  getPendingTasks() {
    return this.tasks.filter(t => t.status === 'pending');
  }

  // Stub to be called on an interval or via webhook
  processQueue() {
    // Execution logic goes here
    logger.info(`[UCIDScheduler] Processing queue of length: ${this.tasks.length}`);
  }
}

export const ucidScheduler = new UCIDScheduler();
