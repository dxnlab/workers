import { describe, test, expect, vi } from 'vitest'
// @ts-ignore @preview
import { createWorker, worker, on, BaseScope } from '@dxnlab/workers/worker'
import { buildMocks, testEventHandlers } from '../base';

// explicit spot self
globalThis.self = globalThis.self || new EventTarget();
const scope = globalThis.self;
const handlers = ()=>buildMocks('onMessage','onMessageError','onError');

describe('background', async ()=>{
  test('classic worker creation', async ()=>{
    const { onMessage, onMessageError, onError } = handlers();
    const base = new EventTarget();
    const classicWorker = createWorker({
      onMessage,
      onMessageError,
      onError,
    }, base);

    expect(classicWorker).toBeDefined();

    testEventHandlers(classicWorker, {
      message: onMessage,
      messageerror: onMessageError,
      error: onError,
    });
  });

  test('worker without basescope', async ()=>{
    /* define without basescope */
    @worker
    class TestWorkerPart extends EventTarget {
      public onMessage;
      public onMessageError;
      public onError;

      constructor(){ 
        super();

        this.onMessage = vi.fn();
        this.onMessageError = vi.fn();
        this.onError = vi.fn();
      }
      

      @on('message')
      handleMessage() { this.onMessage(...arguments) }

      @on('messageerror')
      handleMessageError() { this.onMessageError(...arguments) }

      @on('error')
      handleError() { this.onError(...arguments) }
    }

    // @ts-ignore @test run class decorator
    const w = TestWorkerPart.instance;
    expect(w).toBeDefined();

    //
    expect(w).toBeInstanceOf(EventTarget);

    // emitting events
    testEventHandlers(scope, {
      message: w.onMessage,
      messageerror: w.onMessageError,
      error: w.onError,
    });
  });

  test('worker with basescope', async ()=>{
    @worker
    class TestWorkerFull extends BaseScope {
      public onMessage;
      public onMessageError;
      public onError;

      constructor() {
        super();
        this.onMessage = vi.fn();
        this.onMessageError = vi.fn();
        this.onError = vi.fn();
      }

      @on('message')
      handleMessage({data}:any) { 
        this.onMessage(...arguments);
        // @ts-ignore @test
        this.postback(data);
      }

      @on('messageerror')
      handleMessageError() { this.onMessageError(...arguments) }

      @on('error')
      handleError() { this.onError(...arguments) }
    }
    // @ts-ignore @test
    const w = TestWorkerFull.instance;
    expect(w).toBeDefined();

    expect(w.postback).toBeInstanceOf(Function);

    testEventHandlers(scope, {
      message: w.onMessage,
      messageerror: w.onMessageError,
      error: w.onError,
    })

  })
})