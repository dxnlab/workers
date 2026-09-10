import { describe, test, expect } from 'vitest'
import classicUrl from './cjs.sum?url'
import modularUrl from './decorated.sum?url'

import { register } from '@dxnlab/workers/shared'

describe('shared worker test', async ()=>{
  const puts = [1,2,3,4,5];
  const total = puts.reduce((t,v)=>t+v, 0);

  test('cjs worker quickstart', async ()=>{
    const classic = new SharedWorker(
      new URL(classicUrl, import.meta.url)
    );
    // start the port
    classic.port.start();
    expect(classic).toBeDefined();
    expect(classic).toBeInstanceOf(SharedWorker);
    expect(classic.port).toBeInstanceOf(MessagePort);
    const port = classic.port;
    port.addEventListener('message', ({data})=>{
      console.log('responsed', data);
    });
    const { promise, resolve, reject } = Promise.withResolvers();
    port.addEventListener('message', (ev)=>{
      console.log(ev.data);
      resolve(ev.data);
    });
    classic.addEventListener('messageerror', reject);
    port.addEventListener('error', reject);

    
    port.postMessage(puts);
    const actual = await promise;
    expect(actual).toBe(total);
  });

  test('modular worker quickstart', async ()=>{
    const modular = register(modularUrl);
    expect(modular).toBeDefined();
    expect(modular).toBeInstanceOf(SharedWorker);
    expect(modular.port).toBeInstanceOf(MessagePort);

    const actual = await modular.post(puts);
    console.log('actual', actual);
    expect(actual).toBe(total);
  });
});