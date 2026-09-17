/**
 * ./src/base.ts unit tests
 */

import { describe, test, expect, vi } from "vitest";
import blankUrl from './blank?url';

import { emit } from './base'

import {
  forwardOnce,
  locateUrl,
} from '../src/base'

describe('worker common utilities test', async ()=>{
  const workerSelf = new EventTarget();
  // override workerself
  // @ts-ignore
  globalThis.self = workerSelf;

  test('locateUrl', async ()=>{
    expect(blankUrl).toBeDefined();

    const origin = new URL('', import.meta.url);
    const url = locateUrl(blankUrl);
    expect(url).toBeInstanceOf(URL);
    expect(/blank/i.test(url.pathname)).toBeTruthy();
    expect(origin.origin).toBe(url.origin);
  });

  describe('forwardOnce', async ()=>{
    const sender:any = new EventTarget();
    Object.defineProperty(sender, 'postMessage', { value: vi.fn() });
    const receiver = new EventTarget();

    const testerForwardOnce = async (
      forwardParams:EventTarget[], 
      emitting:'message'|'messageerror'|'error', 
      expectSuccess:boolean)=>{

      try {
        const message = { foo: 'bar' };
        const post = forwardOnce(...forwardParams);
        const rss = post(message);
        const success = vi.fn();
        const failure = vi.fn();
        rss.then(success).catch(failure);
        const emitTarget = forwardParams.includes(receiver) ? receiver : sender;
        setTimeout(()=>{
          emit(emitTarget, emitting, {data: message});
        }, 10);
        console.log(await rss);

        if(expectSuccess) {
          expect(success).toHaveBeenCalled();
          expect(failure).not.toHaveBeenCalled();
        } else {
          expect(success).not.toHaveBeenCalled();
          expect(failure).toHaveBeenCalled();
        }
      } catch(ex) {
        console.log('exception', ex)
      }
    }


    // sender=receiver & message success
    const paramComb = [
      {title: 'single sender', params: [sender] }, 
      {title: 'single sender, explicit', params: [sender, sender] }, 
      {title: 'single sender, timeout', params: [sender, null, 1], failure:true },
      {title: 'sender != receiver', params: [sender, receiver] }, 
      {title: 'sender != receiver, timeout', params: [sender, receiver, 1], failure:true }, 
    ];
    const emitter = {
      message: true,
      messageerror: false,
      error: false,
    };
    // combination
    paramComb.forEach(({title, params,failure})=>{
      Object.entries(emitter).forEach(([etype, expectSuccess])=>{
        test(`${title}: ${etype} => ${expectSuccess}`, async ()=>{
          await testerForwardOnce(params, etype, !failure && expectSuccess);
        });
      });
    });
  })
})