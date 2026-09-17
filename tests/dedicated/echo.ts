/**
 * Example echo worker that pong back any given message
 */

import { worker, on, BaseScope } from '@dxnlab/workers/worker'

@worker
export class EchoWorker extends BaseScope {
  @on('message')
  echo(event:any){
    // @ts-ignore @test
    // this.postback(event.data);
    this.postMessage(event.data);
  }
}
