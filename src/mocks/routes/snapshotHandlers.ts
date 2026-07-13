import { http, HttpResponse, delay } from 'msw';
import { MockSnapshotApi } from '../../lib/api-mock';
import { Snapshot } from '../../types';
import { wrapSuccess } from './sharedState';

export const snapshotHandlers = [
  // GET /api/ucids/:ucid/snapshots
  http.get('/api/ucids/:ucid/snapshots', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const data = await MockSnapshotApi.getSnapshots();
    return HttpResponse.json(wrapSuccess(data));
  }),
  // POST /api/ucids/:ucid/snapshots
  http.post('/api/ucids/:ucid/snapshots', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const body = await request.json() as { snapshot?: Snapshot };
    // Real server.ts destructures `const { snapshot } = req.body`
    // so we mirror that exact convention here for contract parity.
    const snapshot = body.snapshot ?? (body as unknown as Snapshot);
    const data = await MockSnapshotApi.addSnapshot(snapshot);
    return HttpResponse.json(wrapSuccess(data));
  }),
  // PATCH /api/ucids/:ucid/snapshots/:snapshotId/lock
  http.patch('/api/ucids/:ucid/snapshots/:snapshotId/lock', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    return HttpResponse.json(wrapSuccess({ locked: true }));
  }),
  // DELETE /api/ucids/:ucid/snapshots/:snapshotId
  http.delete('/api/ucids/:ucid/snapshots/:snapshotId', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    await MockSnapshotApi.deleteSnapshot(params.snapshotId as string);
    return HttpResponse.json(wrapSuccess({}));
  })
];
