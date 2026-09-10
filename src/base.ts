export const workerSelf = globalThis.self;

export type EventReservation<Events> = {
  event:Events,
  listener:EventListener,
}

export function convertPropertyDefinitions(bindings:{[name:string]:unknown}) {
  return Object.fromEntries(Object.entries(bindings).map(([name, value])=>[
    name,
    {
      value: (typeof value === 'function')
        ? value
        // @ts-ignore
        : function() { workerSelf[name](...arguments) }
    }
  ]));
}

export function locateUrl(location:string|URL) {
  return location instanceof URL
    ? location
    : new URL(location, import.meta.url);
}


export function bindingGlobalScopes(
  target:any, 
  context:DecoratorContext,
  bindings:{[name:string]:unknown},
  initiate:Function=()=>new target
) {
  // 
  return context.metadata!.__instance__ = Object.defineProperties(
    initiate(),
    convertPropertyDefinitions(bindings)
  );
}

export function forwardOnce(sender:any=workerSelf, receiver?:any, timeout:number=1.0e3) {
  return async function(message:any, transfers?:any) {
    // use sender when receiver had not set.
    receiver = receiver || sender;
    // @ts-ignore @future
    const { promise, resolve, reject } = Promise.withResolvers();
    try {
      Object.entries({
        message: ({data}:any)=>resolve(data),
        error: reject,
        messageerror: reject,
      }).forEach(([event, listener])=>receiver.addEventListener(event, listener, { once: true }));
      setTimeout(()=>{
        throw new Error('timeout')
      }, timeout);
    
      sender.postMessage!(message, transfers);
      return promise;
    } catch(exception) {
      reject(exception);
    }
  }
}

export function decoratorOn<R>(event:R)  {
  return function(listener:EventListener, context:DecoratorContext) {
    context.metadata!.listeners = ((context.metadata!.listeners || []) as Array<any>)
      .concat([{ event, listener }]);
  };
}

export function listDecoratedOns<R>(context:DecoratorContext) {
  return (context.metadata!.listeners || []) as Array<EventReservation<R>>;
}

export function emit(source:EventTarget, eventName:string, options:object) {
  const ev = Object.assign(options ?? {}, new CustomEvent(eventName));
  source.dispatchEvent(ev);
}

/**
 * @ts-ignore
 */
export class WorkerGlobalScope extends EventTarget {

  protected dispatchBubble(event:Event, originSource:EventTarget) {
    const ev = Object.assign(event, {originSource});
    this.dispatchEvent(ev);
  }

  /**
   * properties 
   * @refer https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope#instance_properties
   */
  protected get caches(){ return workerSelf.caches }
  protected get crossOriginIsolated(){ return workerSelf.crossOriginIsolated }
  protected get crypto(){ return workerSelf.crypto }
  // @ts-ignore @future
  protected get fonts(){ return workerSelf.fonts }
  protected get indexedDB(){ return workerSelf.indexedDB }
  protected get isSecureContext(){ return workerSelf.isSecureContext }
  protected get location(){ return workerSelf.location }
  protected get navigator(){ return workerSelf.navigator }
  protected get origin(){ return workerSelf.origin }
  protected get performance(){ return workerSelf.performance }
  protected get scheduler(){ return workerSelf.scheduler }
  
  /**
   * worker self invalidate
   * protected get self(){ return workerSelf.self }
   **/

  // @ts-ignore @future
  protected get trustedTypes(){ return workerSelf.trustedTypes }

  /**
   * methods
   * @refer https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope#instance_methods
   */
  protected atob(data:string) { return workerSelf.atob(data) }
  protected btoa(data:string) { return workerSelf.btoa(data) }
  protected clearInterval(id?:number) { return workerSelf.clearInterval(id) }
  protected clearTimeout(id?:number) { return workerSelf.clearTimeout(id) }
  // @ts-ignore @multivariated
  protected createImageBitmap() { return workerSelf.createImageBitmap(...arguments) }
  // @ts-ignore @non-standard @deprecate
  protected dump() { return workerSelf.dump(...arguments) }
  protected fetch(input:URL|RequestInfo, init?:RequestInit) { return workerSelf.fetch(input, init) }
  // @ts-ignore @future
  protected importScripts(...urls:URL[]) { return workerSelf.importScripts(...urls) }
  protected queueMicrotask(callback:VoidFunction) { return workerSelf.queueMicrotask(callback) }
  protected reportError(err:any) { return workerSelf.reportError(err) }
  protected setInterval(handler:TimerHandler, timeout?:number, ...args:any[]) { return workerSelf.setInterval(handler, timeout, ...args) }
  protected setTimeout(handler:TimerHandler, timeout?:number, ...args:any[]) { return workerSelf.setTimeout(handler, timeout, ...args) }
  protected structuredClone(value:any, options?:StructuredSerializeOptions) { return workerSelf.structuredClone(value, options) }
}