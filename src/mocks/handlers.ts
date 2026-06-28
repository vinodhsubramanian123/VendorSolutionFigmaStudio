import { workflowHandlers } from './routes/workflowHandlers';
import { graphHandlers } from './routes/graphHandlers';
import { snapshotHandlers } from './routes/snapshotHandlers';
export const handlers = [...workflowHandlers, ...graphHandlers, ...snapshotHandlers];
