
// [Background][classic] create a service worker to be registered
declare function createServiceWorker(handlers:ServiceWorkerOptions, scope?:EventTarget):EventTarget;


type ServiceWorkerListener<T extends ExtendableEvent> = (e:T)=>unknown;

export type ServiceWorkerOptions = {
  // global scoped events
  onMessage?:SerivceWorkerListener<ExtendableMessageEvent>,
  onMessageError?:SerivceWorkerListener<ExtendableMessageEvent>,
  onActivate?:ServiceWorkerListener<ExtendableEvent>,
  onCookieChange?:SerivceWorkerListener<ExtendableCookieChangeEvent>,
  onFetch?:SerivceWorkerListener<FetchEvent>,
  onPush?:SerivceWorkerListener<PushEvent>,
  onPushSubscriptionChange?:EventListener,
  onSync?:SerivceWorkerListener<SyncEvent>,
  onInstall?:SerivceWorkerListener<ExtendableEvent>,
  onNotificationClick?:SerivceWorkerListener<NotificationEvent>,
  onNotificationClose?:SerivceWorkerListener<NotificationEvent>,
  
  // worker event
  onError:EventListener,
  onStateChange:EventListener,

  // ServiceWorkerGlobalScope @experimental @future
  onBackgroundFetchAbort?:ServiceWorkerListener<BackgroundFetchEvent>,
  onBackgroundFetchClick?:ServiceWorkerListener<BackgroundFetchEvent>,
  onBackgroundFetchFail?:ServiceWorkerListener<BackgroundFetchEvent>,
  onBackgroundFetchSuccess?:ServiceWorkerListener<BackgroundFetchEvent> ;
  onCanMakePayment?:ServiceWorkerListener<CanMakePaymentEvent>,
  onContentDelete?:ServiceWorkerListener<ContentIndexEvent>,
  onPaymentRequest?:SerivceWorkerListener<PaymentRequestEvent>,
  onPeriodicSync?:SerivceWorkerListener<PeriodicSyncEvent>,

};

export type ServiceWorkerClientMatchOption = {
  includeUncontrolled: boolean; 
  type: "window" | "worker" | "sharedworker" | "all";
};

/**
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/Clients
 */
export type Clients = {
  openWindow:(url:string)=>Promise<WindowClient>
  claim:()=>Promise<undefined>,
  get:(id:string)=>Promise<Client>,
  matchAll:(options?:{
    includeUncontrolled:boolean, 
    type:'window'|'worker'|'sharedworker'|'all'
  }) => Promise<Client>
}

/**
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/Client
 */
export type Client = {
  readonly frameType: 'auxiliary' | 'top-level' | 'nested' | 'none',
  readonly id: string,
  readonly type: 'window' | 'worker' | 'sharedworker',
  readonly url: string,
};

/**
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/WindowClient
 */
export type WindowClient = Client & {
  readonly focused: boolean,
  readonly visiblityState: 'hidden' | 'visible',

  focus: ()=>Promise<WindowClient>,
  navigate: (url:string)=>Promise<WindowClient|null>,
}

export type ServiceWorkerStatus = 'parsed' | 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

export type Controller = EventTarget & {
  readonly scriptURL:string,
  readonly state: ServiceWorkerStatus,
  postMessage: (message:any, transfers:any)=>void, // throws SyntaxError
};


export type ServiceWorkerEvent = DedicatedWorkerEvent
  // ServiceWorkerGlobalScope events
  | 'message'
  | 'messageerror'
  | 'activate'
  | 'cookiechange'
  | 'fetch'
  | 'push'
  | 'pushsubscriptionchange'
  | 'sync'
  | 'install'
  | 'notificationclick'
  | 'notificationclose'

  // ServiceWorker events
  | 'error'
  | 'statechange'

  // ServiceWorkerGlobalScope @experimental @future
  | 'backgroundfetchabort'
  | 'backgroundfetchclick'
  | 'backgroundfetchfail'
  | 'backgroundfetchsuccess'
  | 'canmakepayment'
  | 'contentdelete'
  | 'paymentrequest'
  | 'periodicsync'
;



export type ServiceWorkerContainerEvent = 'controllerchange'
| 'message'
| 'messageerror';


export type GetContainerOption = {
  // startMessage option
  noAutoStart?:boolean,

  // worker container events
  onControllerChange?: EventListener,
  onMessage?: EventListener,
  onMessageError?: EventListener,
}

export type RegistrationOption = {
  // options
  scope?:string,
  type?:'classic'|'module',
  updateViaCache?: 'all'|'imports'|'none',

  // container event listeners
  onChange?:EventListener,
  onMessage?: EventListener,
  onMessageError?: EventListener,

  // worker event listeners
  onError?: EventListener,
  onStateChange?: EventListener,
}
