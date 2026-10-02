/**
 * Shared Worker types
 */

import { WorkerGlobalScope } from "./base";

// [Background][classic] create shared worker to be registered
declare function createSharedWorker(handlers:SharedWorkerOptions, scope?:EventTarget):EventTarget;

// [Background][module][class] @sharedWorker class decorator
declare function sharedWorker(cls:any, context:DecoratorContext):void

// [Background][module][method] @on method decorator
declare function on(method:any, context:DecoratorContext):void;

// [Background][module][base] BaseClass for ease
declare class BaseScope extends WorkerGlobalScope {
  // optional parameters for the constructor
  declare constructor(
    suppressPortStartOnConnect:boolean=false,
    discardPortSaveOnConnect:boolean=false,
    suppressOverrideRemoveOnClose:boolean=false,
    suppressDefaultOnConnectListener:boolean=false,
  );

  // postback to (requested) foreground worker
  declare postback(messageEvent:MessageEvent, message:any, transfers?:any):void;
  // broadcast upon ALL foreground workers
  declare broadcast(message:any, transfers?:any, ports?:Array<number|MessagePort>):void;
  // no post, postMessage since a responding port need to be specified
}

// [Background][classic]
export type SharedWorkerEvent = DedicatedWorkerEvent
  | 'connect';

declare interface BaseScopeWithPorts extends BaseScope {
  // optional `ports` property. would not be when:
  //   `discardPortSaveOnConnect`=true or,
  //   `suppressDefaultOnConnectListener`=true.
  get ports():Array<MessagePort>;
  set ports(port:MessagePort):void;
}

export type SharedWorkerOptions = WorkerOptions & {
  extendedLifetime?:boolean,
  sameSiteCookies?:'all'|'none'
}

export type RegistrationOption = WorkerOptions & {
  noAutoStart?: boolean,

  onError?: EventListener,
  // port events
  onMessage?: EventListener,
  onMessageError?: EventListener,
}
