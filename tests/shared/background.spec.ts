import { describe, test, expect } from "vitest";
import { sharedWorker, on, SharedWorkerBase } from '@dxnlab/workers/shared'

@sharedWorker
class Tester extends SharedWorkerBase {
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
    expect(Tester.instance).toBeDefined();

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

    expect(Tester.instance.ports).toBeInstanceOf(Array);
    expect(Tester.instance.ports.length).toBe(1);
  });
})