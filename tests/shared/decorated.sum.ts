import { sharedWorker, on, SharedWorkerBase } from '@dxnlab/workers/shared'

@sharedWorker
export class SumWorker extends SharedWorkerBase {
  total(
    values:number[], 
    // @ts-ignore
    operation:(l:number,r:number)=>number=(l:number,r:number)=>(l + r), 
    init:number=0) {
      return values.reduce(operation, init);
  }

  @on('message')
  async summation({data, port}:any) {
    const dataArray = Array.from(data) as number[];
    const summation = this.total(dataArray);

    await port.post(summation, undefined);
    // await Promise.all(this.post(summation, undefined, port));
  }

  @on('error')
  onError(event:Event) {
    console.error('ERR', event);
  }

  @on('messageerror')
  onMessageError(event:Event) {
    console.error('MSG ERR', event);
  }
}