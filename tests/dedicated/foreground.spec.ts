/**
 * (Dedicated) worker foreground registration test
 */

import { describe, test, expect, vi } from "vitest";
import { emit } from '../base'
// @ts-ignore @preview
import { register } from '@dxnlab/workers/worker'
// @ts-ignore @preview
import moduleUrl from './echo?url'



describe('dedicated worker foreground registration', async ()=>{
  // register the worker
  const onError = vi.fn(console.log);
  const onMessageError = vi.fn(console.log);
  let latestMessage:any;
  const onMessage = vi.fn(({data}:any)=>{
    latestMessage = data;
  });
  const worker = register(moduleUrl, {
    onError,
    onMessage,
    onMessageError,
  });

  test('foreground units', async ()=>{
    expect(worker).toBeInstanceOf(Worker);
    // post method
    expect(worker.post).toBeInstanceOf(Function);

    // async function works
    const response = worker.post({ foo: 'bar' });
    expect(response).toBeInstanceOf(Promise);
    const rss = await response;
    expect(rss).toBeDefined();
    console.log('rss', rss);
  });

  test('foreground listeners at work', async ()=>{
    // invoke error
    emit(worker, 'error');
    expect(onError).toHaveBeenCalled();

    // invoke messageerror
    emit(worker, 'messageerror');
    expect(onMessageError).toHaveBeenCalled();

    // invoke message
    emit(worker, 'message', { data: 'ping' });
    expect(onMessage).toHaveBeenCalled();
    expect(latestMessage).toBe('ping');
  })
});
