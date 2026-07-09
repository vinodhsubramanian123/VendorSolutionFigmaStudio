import { workflowHandlers } from './routes/workflowHandlers';
import { vendorAgentHandlers } from './routes/vendorAgentHandlers';
import { graphHandlers } from './routes/graphHandlers';
import { snapshotHandlers } from './routes/snapshotHandlers';
export const handlers = [...workflowHandlers, ...vendorAgentHandlers, ...graphHandlers, ...snapshotHandlers];
