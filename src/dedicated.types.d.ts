/**
 * Dedicated Worker types
 */

import type { WorkerGlobalScope } from "./base";

// [Background][classic] create dedicated worker to be registered
declare function createWorker(handlers:ClassicWorkerOption, scope?:EventTarget):EventTarget

// [Background][classic] worker options
export type ClassicWorkerOption = BaseWorkerHandlers & {
    onMessage: EventListener,
    onMessageError: EventListener,
    onRTCTransform: EventListener,
}



// [Background][module][class] @worker class decorator, 
//  to create dedicated worker
declare function worker(cls:any, context:DecoratorContext):void

// [Background][module][method] @on method decorator,
//  to assign the method at worker event listener
declare function on(method:any, context:DecoratorContext):void

/**
 * [Background][module][method] @on method decorator settable event types
 * Events that can be applied to the Worker
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope#events
 */
export type DedicatedWorkerEvent = 'message'
  | 'error'
  | 'languagechange'
  | 'online'
  | 'offline'
  | 'rejectionhandled'
  | 'securitypolicyviolation'
  | 'unhandledrejection'
  | 'rtctransform'

// [Background][module][base] BaseClass for ease
declare class BaseScope extends WorkerGlobalScope {
  // non-parameterized public constructor at MUST
  declare constructor():BaseScope;
  // postback to foreground
  declare postback(response:any, transfers?:any):void
  
  // wrapped WorkerGlobalScope
  // - properties
  declare get name():string
  // - methods
  declare close():void
  declare postMessage(message:any, transfers?:any):void
  declare cancelAnimationFrame(id:number):void
  declare requestAnimationFrame(callback:FrameRequestCallback):number
}

/**
 * [Foreground] registered worker instance type
 */
export interface RegisteredWorkerGlobalScope extends Worker {
  declare async post(message:any, transfers:any):Promise<unknown>
}


export type WorkerOptions ={
  name?:string
  credentials?:RequestCredentials,
  type?:'classic'|'module',

  onError?: EventListener,
  onMessageError?:EventListener,
  onMessage?:EventListener,
};



// [Foreground][common] worker registration option
export type RegistrationOption = WorkerOptions & {
  onError?: EventListener,
  onMessage?: EventListener,
  onMessageError?: EventListener,
};

