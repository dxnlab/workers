
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
// @ts-ignore
import serviceWorkerUrl from './fetcher?url'
// @ts-ignore
import classicWorkerUrl from './classic?url'
// @ts-ignore
import { register, getContainer } from '@dxnlab/workers/service'


async function clearRegistration() {
  const container = getContainer();
  const registration = await container.getRegistration(serviceWorkerUrl);
  console.log(await container.getRegistrations());
  if(registration) {
    await registration.unregister();
    return true;
  }
  return false;
}

describe('test service worker fetch', async ()=>{
  beforeAll(async ()=>{
    // clear registration if exists
    console.log('beforeAll', await clearRegistration());
  })

  afterAll(async ()=>{
    console.log('afterAll', await clearRegistration());
  })

  test('classic worker test', async ()=>{
    const container = globalThis.navigator.serviceWorker;
    const registration = container.register(
      new URL(classicWorkerUrl, import.meta.url),
      { scope: '/', type: 'classic' },
    );
    await container.ready;
    const worker = (await registration).active;
    expect(worker).toBeInstanceOf(ServiceWorker);
    
    const { promise, resolve, reject } = Promise.withResolvers();
    container.addEventListener('message', (ev)=>{
      console.log('fore got message', ev.data);
      if(ev.data === 'ping') {
        resolve(ev.data);
      }
    });
    container.addEventListener('messageerror', reject);
    worker?.postMessage('ping');
    await promise;
  });

  test.skip('service worker', async ()=>{
    const container = getContainer({ 
      // onMessage: (ev)=>console.log('container got message of', ev),
      onMessageError: console.error,
      onError: console.error,
    });
    expect(container).toBeInstanceOf(ServiceWorkerContainer);
    container.onmessage = (ev:any)=>{
      console.log('container got message of', ev);
    }

    const worker = await register(serviceWorkerUrl, {
      scope: '/',
      type: 'module',
    }, container);
    console.log('worker registered', worker);
    expect(worker).toBeDefined();
    expect(worker).toBeInstanceOf(ServiceWorker);
    expect(worker.state).toBe('activated');

    expect(worker.post).toBeInstanceOf(Function);
    
    // try fetch now
    const message = 'foo';
    const ping = await worker.post(message);
    expect(ping).toBe(message);
  });
});


