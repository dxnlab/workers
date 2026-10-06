/**
 * BaseTypes
 */


/**
 * @core decorated class event listener reservation
 *   Which will recorded into context.metadata,
 *   Later loaded at class initializer to be registered.
 */
export type EventReservation<Events> = {
  event:Events,
  listener:EventListener,
}


/**
 * @core common EventHandler map 
 *   for classic worker declaration
 */
export type BaseWorkerHandlers = {
  onError: EventListener,
  onLanguageChange: EventListener,
  onOnline: EventListener,
  onOffline: EventListener,
  onRejectionHandled: EventListener,
  onSecurityPolicyViolation: EventListener,
  onUnhandledRejection: EventListener,
}

/**
 * @core common postMessage function declaration
 */
type WorkerMessagePost = (message:any, option:Transferable[]|{transfer:Transferable[]})=>void;

export type ForegroundWorkerBase = {
  post: WorkerMessagePost,
  close: ()=>void,
}

/** 
 * Web Worker 
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
 **/
export type WorkerURL = string | URL;
export type WorkerOptions ={
  name?:string
  credentials?:RequestCredentials,
  type?:'classic'|'module',

  onError?: EventListener,
  onMessageError?:EventListener,
  onMessage?:EventListener,
};

/** 
 * Shared Worker 
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker
 **/
export type SharedWorkerOptions = WorkerOptions & {
  extendedLifetime?:boolean,
  sameSiteCookies?:'all'|'none'
}
export type SharedWorkerDXN = SharedWorker & {
  // postMessage on the port
  post: WorkerMessagePost,
  // close the port then terminate
  close: ()=>void,
}

/**
 * Service Worker 
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 **/


export type ServiceMessageTransferables = Transferable[]|{transfer:Transferable[]};
type ServiceMessagePost = (message:any, transfers:ServiceMessageTransferables)=>any;

export type ServiceWorkerDXN = ServiceWorker & {
  post: ServiceMessagePost,
}

export enum WorkerTypes {
  Worker = 'worker',
  Shared = 'sharedWorker',
  Service = 'serviceWorker',
};

export type HandlerEntry = [string, EventListener];
export type HandlerEntries = Array<HandlerEntry>;