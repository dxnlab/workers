// @ts-nocheck
import { describe, test, expect } from "vitest";
import { sharedWorker, on, BaseScope } from '@dxnlab/workers/shared'

@sharedWorker
class Tester extends BaseScope {
  @on('message')
  onMessageHandler({data, port}) {
    console.log('got message', { data, port });
  }
}

function forceEmitEvent(source:EventTarget, event:string, payloads={}) {
  const ev = Object.assign(new CustomEvent(event), payloads);
  source.dispatchEvent(ev);
}

describe('test shared worker background', async () => {
  test('get a sharedWorkerBase', async ()=>{

    const { promise, resolve, reject } = Promise.withResolvers();
    const port = {
      start: ()=>undefined,
      // mock event listener
      addEventListener: (event:string, listener:EventListener)=>{
        resolve({event,listener});
      }
    };
    const timeout = setTimeout(reject, 0.5e3);
    promise.finally(clearTimeout(timeout));
    forceEmitEvent(globalThis.self, 'connect', { ports: [port] });

    const response = await promise;
    expect(response).toBeDefined();
    expect(response.event).toBe('message');
    expect(response.listener).toBeInstanceOf(Function);
  });
})