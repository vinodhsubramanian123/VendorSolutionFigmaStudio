import { setupWorker, SetupWorker } from 'msw/browser';
import { handlers } from './handlers';

export class MockServerController {
  private worker: SetupWorker;

  constructor() {
    this.worker = setupWorker(...handlers);
  }

  async start() {
    return this.worker.start({ onUnhandledRequest: 'bypass' });
  }

  stop() {
    this.worker.stop();
  }
}

export const mockServer = new MockServerController();
