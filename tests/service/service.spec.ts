
import { describe, test, expect } from 'vitest'
// @ts-ignore
import serviceWorkerUrl from './fetcher?url'
// @ts-ignore
import { register, getContainer } from '@dxnlab/workers/service'


describe('test service worker fetch', async ()=>{
  test('service worker', async ()=>{
    const container = getContainer({ 
      onMessage: console.log,
      onMessageError: console.error,
      onError: console.error,
    });
    expect(container).toBeInstanceOf(ServiceWorkerContainer);

    const worker = await register(serviceWorkerUrl, container);
    expect(worker).toBeDefined();
    expect(worker).toBeInstanceOf(ServiceWorker);
    expect(worker.state).toBe('activated');

    // try fetch now
    const message = 'foo';
    const ping = await worker.post(message);
    expect(ping).toBe(message);
  });
});


