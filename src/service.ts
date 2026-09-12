import { decoratorOn, forwardOnce, hasDecoratedOnsOf, listDecoratedOns, locateUrl, registerEventHandler, WorkerGlobalScope, workerSelf } from './base';
import type { DedicatedWorkerEvent } from './worker';


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

const ServiceWorkerExperimentalEvents = [
  'backgroundfetchabort',
  'backgroundfetchclick',
  'backgroundfetchfail',
  'backgroundfetchsuccess',
  'canmakepayment',
  'contentdelete',
  'paymentrequest',
  'periodicsync'
];
const SerivceWorkerControllerEvents = [
  'error',
  'statechange',
];


export const on = decoratorOn<ServiceWorkerEvent>;

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

function onWorkerActivateDefaultBuilder(target:any, context:DecoratorContext) {
  // @ts-ignore
  return (ev)=>{
    listDecoratedOns<ServiceWorkerEvent>(context)
      .filter(({event})=>SerivceWorkerControllerEvents.includes(event))
      .forEach(({event, listener})=>{
        if(ServiceWorkerExperimentalEvents.includes(event)) {
          console.warn(`ServiceWorker:${event} - experimental`);
        }
        target.serviceWorker?.addEventListener(event, listener.bind(target));
      });
  }
}

function appendDefaultWorkerActivated(target:any, context:DecoratorContext) {
  // append default binding
  if(!context.metadata!.onWorkerActiveDefault) {
    context.metadata!.onWorkerActiveDefault 
      = onWorkerActivateDefaultBuilder(target, context);
  } {
    // clear duplicate if exists
    workerSelf.removeEventListener(
      'activate',
      context.metadata!.onWorkerActiveDefault as EventListener);
    // adding activate handler
    on('activate')
    (context.metadata!.onWorkerActiveDefault as EventListener, context);
  }
}

function bindingMetaListeners(target:any, context:DecoratorContext) {
  listDecoratedOns<ServiceWorkerEvent>(context)
    .filter(({ event })=>!SerivceWorkerControllerEvents.includes(event))
    .forEach(({ event, listener })=>{
      if(ServiceWorkerExperimentalEvents.includes(event)) {
        console.warn(`ServiceWorkerGlobalScope:${event} - experimental`);
      }
      workerSelf.addEventListener(event, listener.bind(target));
    });
}

export function serviceWorker(cls:any, context:DecoratorContext) {
  context.addInitializer(()=>{
    const target = new cls;
    // add default on active
    if(hasDecoratedOnsOf<ServiceWorkerEvent>(context, SerivceWorkerControllerEvents)) {
      appendDefaultWorkerActivated(target, context);
    }
    // binding listners
    bindingMetaListeners(target, context);
  });
}



export class BaseScope extends WorkerGlobalScope {

  protected readonly post:(message:any, transfers?:any)=>Promise<unknown>

  constructor() {
    super();
    this.post = forwardOnce(this.serviceWorker);
  }

  /* ServiceWorkerGlobalScope aliasing */
  // @ts-ignore
  protected get clients():Clients { return workerSelf.clients }
  protected get cookieStore():CookieStore { return workerSelf.cookieStore }
  // @ts-ignore
  protected get registration():ServiceWorkerRegistration { return workerSelf.registration }
  // @ts-ignore
  protected get serviceWorker():ServiceWorker { return workerSelf.serviceWorker }

  protected skipWaiting():Promise<undefined> { 
    // @ts-ignore
    return workerSelf.skipWaiting();
  }


  /* ServiceWorker instance aliasing */
  protected get scriptURL() { return this.serviceWorker.scriptURL }
  protected get state() { return this.serviceWorker.state }
  protected postMessage(message:any, transfers?:any) { 
    return this.serviceWorker.postMessage(message, transfers) ;
  }
}

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

  // worker client events
  onError?: EventListener,
  onStateChange?: EventListener,
}

const resolver = (resolve:Function, reject:Function, { active, waiting, installing }:any)=>{
  try {
    if(active) { resolve(active) }
    else if((waiting || installing)) {
      (waiting || installing).addEventListener('statechange',
        (ev:any)=>resolver(resolve, reject, ev),
        { once: true }
      );
    }
  } catch(ex) {
    reject(ex);
  }
}

function getActiveServiceWorkerWhileRegistration(target:any):Promise<ServiceWorker> {
  const { promise, resolve, reject } = Promise.withResolvers();
  resolver(resolve, reject, target);
  return promise as Promise<ServiceWorker>;
}

export function getContainer(options?:GetContainerOption):ServiceWorkerContainer { 
  const container = globalThis?.navigator?.serviceWorker;
  if(container == null) {
    // TODO: Exception
    throw new TypeError('ServiceWorker not provided');
  }
  registerEventHandler(container, 'controllerchange', options);
  registerEventHandler(container, 'message', options);
  registerEventHandler(container, 'messageerror', options);

  if(!(options?.noAutoStart)) {
    container.startMessages();
  }
  return container;
}

export async function register(location:string|URL, options:RegistrationOption={}, container?:ServiceWorkerContainer) {
  container = container || getContainer();
  const url = locateUrl(location);
  const registration = await container.register(url, {
    scope: options?.scope,
    type: options?.type || 'module',
    updateViaCache: options?.updateViaCache,
  });
  const worker = await getActiveServiceWorkerWhileRegistration(registration);
  console.log('worker registration', worker);
  Object.defineProperty(worker, 'post', { value: forwardOnce(worker) });

  registerEventHandler(worker, 'error', options);
  registerEventHandler(worker, 'statechange', options);

  return worker;
}
