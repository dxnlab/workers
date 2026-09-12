/**
 * Example echo worker that pong back any given message
 */

import { worker, on, BaseScope } from '@dxnlab/workers/worker'

@worker
export class EchoWorker extends BaseScope {
  @on('message')
  async echo({data}:any){
    this.postMessage(data);
  }
}
