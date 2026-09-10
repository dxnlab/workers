/**
 * Example echo worker that pong back any given message
 */

import { worker, on, DedicatedWorkerBase } from '@dxnlab/workers/worker'

@worker
export class EchoWorker extends DedicatedWorkerBase {
  @on('message')
  async echo({data}:any){
    this.postMessage(data);
  }
}
