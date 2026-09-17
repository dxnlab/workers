import { worker, on, BaseScope } from '@dxnlab/workers/worker'

@worker
export class TestDedicatedWorker extends BaseScope {
  @on('message')
  onMessage(event:any) {
    switch(event.data) {
      // invoke error
      case 'error':
      // invoke message error
      case 'messageerror':
      // others
      default:
        this.postback(event, event.data);
    }
  }

}