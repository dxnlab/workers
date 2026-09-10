import { describe, test, expect } from 'vitest'

import cjsUrl from './cjs.echo?url'
import modUrl from './decorated.echo?url'

import { register } from '@dxnlab/workers/worker'

const registerRaw = (url:string, options?:WorkerOptions)=>new Worker(
  new URL(url, import.meta.url), 
  options
);

const testEcho = async (worker:Worker, ping:any) => {
  const { promise, resolve, reject }  = Promise.withResolvers();
  // appending event handlers
  worker.addEventListener('message', ({data})=>resolve(data));
  worker.addEventListener('error', reject);

  // post a single random message
  worker.postMessage(ping);
  return promise;
}

describe('dedicated worker tests', async ()=> {
  // testing registration
  await test('registration', async ()=>{
    const classic = register(cjsUrl, { type: 'classic' });
    const modular = register(modUrl);
    [classic, modular].forEach((w)=>{
      expect(w).toBeInstanceOf(Worker);
      expect(w.addEventListener).toBeInstanceOf(Function);
      expect(w.postMessage).toBeInstanceOf(Function);
    });

    // async post test:classic
    expect(classic.post).toBeInstanceOf(Function);
    const cmsg = Math.random();
    await expect(await classic.post(cmsg)).toBe(cmsg);

    // async post test:modular
    expect(modular.post).toBeInstanceOf(Function);
    const mmsg = Math.random();
    await expect(await modular.post(mmsg)).toBe(mmsg);

  });

  // testing dedicated:classic worker run
  await test('cjs worker', async ()=>{
    const foreground = registerRaw(cjsUrl, { type: 'classic' });
    // test if foreground worker presented
    expect(foreground).toBeInstanceOf(Worker);
    expect(foreground.postMessage).toBeDefined();

    // test posting a message and retrieve the echo
    const expected = 'hello, dedicated worker';
    const actual = await testEcho(foreground, expected);
    expect(actual).toBe(expected);
  });

  // testing dedicated:decorated worker run
  await test('modular worker', async ()=>{
    const foreground = registerRaw(modUrl, { type: 'module' });
    
    expect(foreground).toBeInstanceOf(Worker);
    expect(foreground.postMessage).toBeDefined();

    const expected = 'hello, modular worker';
    const actual = await testEcho(foreground, expected);
    console.log({ expected, actual });
    expect(actual).toBe(expected);
  });
});