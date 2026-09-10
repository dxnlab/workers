import type { ForegroundWorkerBase, ForegroundWorkerDeterminantBase } from "@/types";
import type { WorkerBackgroundDeterminant } from "@/worker.old/types";

export type ForegroundServiceWorker = ServiceWorker & ForegroundWorkerBase & {
};

export type ServiceWorkerForegroundDeterminant = ForegroundWorkerDeterminantBase & {
  onStateChange: EventListener,
};

// https://developer.mozilla.org/en-US/docs/Web/API/Client
type Client = {
  readonly frameType: 'auxiliary' | 'top-level' | 'nested' | 'none',
  readonly id: string,
  readonly type: 'window' | 'worker' | 'sharedworker',
  readonly url: string,
}

type WindowClient = {
  readonly focused: boolean,
  readonly visiblityState: 'hidden' | 'visible',

  focus: ()=>Promise<WindowClient>,
  navigate: (url:string)=>Promise<WindowClient|null>,
}

type Clients = {
  openWindow:(url:string)=>Promise<WindowClient>
  claim:()=>Promise<undefined>,
  get:(id:string)=>Promise<Client>,
  matchAll:(options?:{
    includeUncontrolled:boolean, 
    type:'window'|'worker'|'sharedworker'|'all'
  }) => Promise<Client>
}

type ServiceWorkerGlobalScope = WindowOrWorkerGlobalScope & {
  readonly clients:Clients
  readonly cookieStore:CookieStore,
  readonly registration:ServiceWorkerRegistration,
  readonly serviceWorker:ServiceWorker,

  //
  skipWaiting: ()=>Promise<undefined>,
}

export type BackgroundServiceWorker = ServiceWorkerGlobalScope & {

};

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope#events
export type ServiceWorkerBackgroundDeterminant = WorkerBackgroundDeterminant & {
  onActive: EventListener,
  onCookieChange: EventListener,
  onFetch: EventListener,
  onPush: EventListener,
  onPushSubscriptionChange: EventListener,
  onSync: EventListener,
  onInstall: EventListener,
  onNotificationClick: EventListener,
  onNotificationClose: EventListener,
  
  // in lab:
  onBackgroundFetchAbort: EventListener,
  onBackgroundFetchClick: EventListener,
  onBackgroundFetchFail: EventListener,
  onBackgroundFetchSuccess: EventListener,
  onCanMakePayment: EventListener,
  onPaymentRequest: EventListener,
  onContentDelete: EventListener,
  onPeriodicSync: EventListener,

}