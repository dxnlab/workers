import { 
  decoratorOn, 
  forwardOnce, 
  hasDecoratedOnsOf, 
  locateUrl, 
  registerEventHandler, 
  WorkerGlobalScope, 
  workerSelf 
} from './base';
import { 
  appendDefaultWorkerActivated, 
  bindingMetaListeners, 
  getActiveServiceWorkerWhileRegistration, 
  partitionEventHandlers, 
  registerControllerDefaultHandler, 
  SerivceWorkerControllerEvents 
} from './service.feat';
import type { 
  GetContainerOption, 
  RegistrationOption, 
  ServiceWorkerClientMatchOption, 
  ServiceWorkerEvent, 
  ServiceWorkerOptions 
} from './service.types';

/**
 * Service Worker
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker
 */


/**
 * get service worker container, either fore&back
 * @param options 
 * @returns 
 */
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


/**
 * Background (Worker procedure side)
 */

// [classic] 
// export createServiceWorker({ onMessage: (ev)=>void })


/**
 * @core classic mode shared worker declaration function
 * @param handlers { eventType: listenerFunction } object
 * @param scope background basescope
 * @returns Promise<ServiceWorker>
 */
export async function createServiceWorker(handlers:ServiceWorkerOptions, scope?:EventTarget) {
  const registrationEvent = 'activate';

  const target = scope || workerSelf;
  const { controllers, workers } = partitionEventHandlers(handlers);
  
  // when controller events are presented
  const controllerDefault = registerControllerDefaultHandler(target, controllers);
  if(controllerDefault) {
    workers.push(registrationEvent, registerControllerDefaultHandler);
  }
  // append worker event handlers
  return workers.reduce((t, [etype, handler])=>{
    t.addEventListener(etype, handler);
    return t;
  }, target);
}



// [modular] 
// @serviceWorker
// export class extends BaseScope { 
//    @on('message')
//    onMessageHandle(event) {
//        const data = event.data!;
//        /* things with message data */
//    }
// }


/**
 * @core decorator for a modular SharedWorker background
 * @param cls the target class
 * @param context Decorator context
 * 
 * @caution ! MUST be created by non-parameterized `new <class>`
 *   private constructor, and/or non-optional parameters are not available.
 */
export function serviceWorker(cls:any, context:DecoratorContext) {
  context.addInitializer(()=>{
    const target = new cls;
    // add default on active
    if(hasDecoratedOnsOf<ServiceWorkerEvent>(context, SerivceWorkerControllerEvents)) {
      appendDefaultWorkerActivated(target, context);
    }
    // binding listeners
    bindingMetaListeners(target, context);
  });
}



/**
 * @core decorator for module worker event handlers.
 * @param event:ServiceWorkerEvent that'd be processed by the worker
 * @returns 
 */
export const on = decoratorOn<ServiceWorkerEvent>;


/**
 * @core The base class for an ServiceWorker
 *   with aliasing basescope (`window.self`) properties/methods,
 *   adds 
 *     - get controller:ServiceWorker === get serviceWorker
 *     - get container:ServiceWorkerContainer === get self.navigator.serviceWorker
 *     - postback:(event, message, transfers?)=>void
 *     - broadcast:(message, transfers?, matchOptions?)=>void
 *   unlike dedicated worker,
 *     x postMessage; the client should be specified
 */
export class BaseScope extends WorkerGlobalScope {

  constructor() { super(); }

  /* ServiceWorkerGlobalScope aliasing */
  // @ts-ignore
  protected get clients():Clients { return workerSelf.clients }
  protected get cookieStore():CookieStore { return workerSelf.cookieStore }
  // @ts-ignore
  protected get registration():ServiceWorkerRegistration { return workerSelf.registration }
  // @ts-ignore
  protected get serviceWorker():ServiceWorker { return workerSelf.serviceWorker }

  // service worker controller aliasing === this.serviceWorker
  protected get controller():ServiceWorker { return this.serviceWorker }
  /**
   * Firefox / Safari (+iOS) supports only as of 2026.Oct.02.
   * @refer https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer#browser_compatibility
   **/ 
  // // global scoped navigator aliasing === self.navigator
  // protected get navigator(){ return workerSelf.navigator }
  // // global scoped service worker container aliasing === self.navigator.serviceWorker
  // protected get container(){ return this.navigator.serviceWorker }

  protected skipWaiting():Promise<undefined> { 
    // @ts-ignore
    return workerSelf.skipWaiting();
  }

  protected postback(event:any, message:any, transfers?:any) {
    const { source } = event;
    source.postMessage(message, transfers);
  }

  protected async broadcast(message:any, transfers?:any, matchOptions?:ServiceWorkerClientMatchOption) {
    const clients = matchOptions 
      ? await this.clients.matchAll(matchOptions)
      : this.clients;
    Array.from(clients).forEach((client:any)=>{
      client.postMessage(message, transfers);
    });
  }

  protected postMessage(message:any, transfers?:any) {
    // @ts-ignore
    return this.serviceWorker.postMessage(message, transfers);
  }


  /* ServiceWorker instance aliasing */
  protected get scriptURL() { return this.serviceWorker.scriptURL }
  protected get state() { return this.serviceWorker.state }
}





/**
 * Foreground (Browser side)
 */


/**
 * @core register the worker at foreground. type "module" at default
 * @param location 
 * @param options 
 * @returns 
 */
export async function register(location:string|URL, options?:RegistrationOption, container?:ServiceWorkerContainer) {
  container = container || getContainer();
  const url = locateUrl(location);
  const registration = await container.register(url, options || {});
  const worker = await getActiveServiceWorkerWhileRegistration(registration);
  
  Object.defineProperty(worker, 'post', { value: forwardOnce(worker, container) });

  // setup event handlers
  [
    'change',
    'message',
    'messageerror',
    'error',
    'statechange',
  ].forEach((eventKey)=>{
    registerEventHandler(worker, eventKey, options);
  });

  return worker;
}
