/**
 * Service Worker types
 */

// [Common] get service worker container, either fore&back
declare function getContainer(options?:GetContainerOption):ServiceWorkerContainer;

// [Background][classic] create a service worker to be registered
declare function createServiceWorker(handlers:ServiceWorkerOptions, scope?:EventTarget):EventTarget;

// [Background][module][class] @serviceWorker class decorator
declare function serviceWorker(cls:any, context:DecoratorContext):void;

// [Background][module][method] @on method decorator
declare function on(method:any, context:DecoratorContext):void;

// [Background][module][method] Base class for ease
declare class BaseScope extends WorkerGlobalScope  {
  declare get clients():Clients;
  declare get cookieStore():CookieStore;
  declare get registration():ServiceWorkerRegistration;
  declare get serviceWorker():ServiceWorker;
  declare get controller():ServiceWorker;
  
  // skip waiting to be installed
  declare skipWaiting():Promise<undefined>;
  // postback to the foreground worker that has sent the message
  declare postback(event:any, message:any, transfers?:any):void;
  // broadcast to all foreground workers
  declare broadcast(message:any, transfers?:any, matchOptions?:ServiceWorkerClientMatchOption):Promise<void>;
  
  declare get scriptURL():string;
  declare get state():ServiceWorkerStatus;
};

/** featuring types */
// [Common] ServiceWorker event listener type
type ServiceWorkerListener<T extends ExtendableEvent> = (e:T)=>unknown;


// [Background][module][method] ServiceWorkerClientMatchOption type
export type ServiceWorkerClientMatchOption = {
  includeUncontrolled: boolean; 
  type: "window" | "worker" | "sharedworker" | "all";
};



// [Foreground] Registration options for the service worker
export type ServiceWorkerOptions = {
  // global scoped events
  onMessage?:ServiceWorkerListener<ExtendableMessageEvent>,
  onMessageError?:ServiceWorkerListener<ExtendableMessageEvent>,
  onActivate?:ServiceWorkerListener<ExtendableEvent>,
  onCookieChange?:ServiceWorkerListener<ExtendableCookieChangeEvent>,
  onFetch?:ServiceWorkerListener<FetchEvent>,
  onPush?:ServiceWorkerListener<PushEvent>,
  onPushSubscriptionChange?:EventListener,
  onSync?:ServiceWorkerListener<SyncEvent>,
  onInstall?:ServiceWorkerListener<ExtendableEvent>,
  onNotificationClick?:ServiceWorkerListener<NotificationEvent>,
  onNotificationClose?:ServiceWorkerListener<NotificationEvent>,
  
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
  onPaymentRequest?:ServiceWorkerListener<PaymentRequestEvent>,
  onPeriodicSync?:ServiceWorkerListener<PeriodicSyncEvent>,

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
