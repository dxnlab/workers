type EventListener = (event:Event)=>void;
type WorkerMessagePost = (message:any, option:Transferable[]|{transfer:Transferable[]})=>void;

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
export type WorkerDXN = Worker & {
  // postMessage alias
  post: WorkerMessagePost,
  // terminate alias
  close: ()=>void
}

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
export type ServiceWorkerOptions = {
  // register options
  scope?: string,
  type?: 'classic'|'module',
  updateViaCache: 'all'|'imports'|'none',

  // container event listeners
  onChange?:EventListener,
  onMessage?: EventListener,
  onMessageError?: EventListener,

  // worker event listeners
  onError?: EventListener,
  onStateChange?: EventListener,
};

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