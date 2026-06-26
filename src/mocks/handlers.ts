import { coreHandlers } from './routes/coreHandlers';
import { graphHandlers } from './routes/graphHandlers';
export const handlers = [...coreHandlers, ...graphHandlers];
