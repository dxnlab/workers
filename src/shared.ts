import { 
  decoratorOn, 
  forwardOnce, 
  locateUrl, 
  registerEventHandler, 
  WorkerGlobalScope, 
  workerSelf,
} from "./base";
import { appendDefaultOnConnect, appendPortEventsOnConnect, assignPortsProperty, bindingMetaListeners, partitionEventHandlers } from "./shared.feat";
import type { RegistrationOption, SharedWorkerEvent, SharedWorkerOptions } from "./shared.types";
import type { HandlerEntry } from "./types";

/**
 * Shared Worker
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
 */


/**
 * Background (Worker procedure side)
 */

// [classic] 
// export createSharedWorker({ onMessage: (ev)=>void })

/**
 * @core classic mode shared worker declaration function
 * @param handlers { eventType: listnerFunction } object
 * @param scope background basescope
 * @returns SharedWorkerGlobalScope
 */
export function createSharedWorker(handlers:SharedWorkerOptions, scope?:EventTarget) {
    // filter port/worker events
  const { ports, workers } = partitionEventHandlers(handlers);
  
  // when port events are presented,
  // add default handler on connection
  appendPortEventsOnConnect(ports, workers);

  // setup target scope & return
  return workers.reduce((target:any, entry:HandlerEntry)=>{
    const [etype, handler] = entry;
    target.addEventListener(etype, handler);
  }, scope || workerSelf);
}


// [modular] 
// @sharedWorker
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
export function sharedWorker(cls:any, context:DecoratorContext) {
  context.addInitializer(()=>{
    const target = new cls;
    // mixin "ports" property
    assignPortsProperty(target, context);
    // add default on connect bubbling event handle
    appendDefaultOnConnect(target, context);
    // binding listeners
    bindingMetaListeners(target, context);
  });
}

/**
 * @core decorator for module worker event handlers.
 * @param event:SharedWorkerEvent that'd be processed by the worker
 * @returns 
 */
export const on = decoratorOn<SharedWorkerEvent>;



/**
 * @core The base class for an SharedWorker
 *   with aliasing basescope (`window.self`) properties/methods,
 *   adds 
 *     - postback:(message, transfers?)=>void
 *     - broadcast:(message, transfers?)=>void
 *   unlike dedicated worker,
 *     x postMessage; the port should be specified
 */
export class BaseScope extends WorkerGlobalScope {

  protected readonly suppressPortStartOnConnect:boolean;
  protected readonly discardPortSaveOnConnect:boolean;
  protected readonly suppressDefaultOnConnectListener:boolean;
  protected readonly suppressOverrideRemoveOnClose:boolean;
  
  /**
   * 
   * @param suppressPortStartOnConnect When "true", the port MUST be explicitly started after connect. default false.
   * @param discardPortSaveOnConnect When "true", it does not assign "ports" property, also can not use "post" method.
   * @param suppressOverrideRemoveOnClose When "true", it does not override port close method that to remove the target port from the list.
   * @param suppressDefaultOnConnectListener When "true", default onConnect handler does not added on the worker. 
   *  Which in consequence to set above 'discardPortSaveOnConnect' to be true, either.
   */
  constructor(
    suppressPortStartOnConnect:boolean=false,
    discardPortSaveOnConnect:boolean=false,
    suppressOverrideRemoveOnClose:boolean=false,
    suppressDefaultOnConnectListener:boolean=false,
  ) { 
    super();

    
    // option flags
    this.suppressPortStartOnConnect = suppressPortStartOnConnect;
    this.discardPortSaveOnConnect = suppressDefaultOnConnectListener || discardPortSaveOnConnect;
    this.suppressOverrideRemoveOnClose = suppressDefaultOnConnectListener || suppressOverrideRemoveOnClose;
    this.suppressDefaultOnConnectListener = suppressDefaultOnConnectListener;
  }

  protected postback(messageEvent:MessageEvent, message:any, transfers?:any) {
    Array.from(messageEvent.ports)
      .forEach((port:MessagePort)=>port.postMessage(message, transfers));
  }

  protected broadcast(message:any, transfers?:any, ports?:Array<MessagePort|number>) {
    if(this.discardPortSaveOnConnect) {
      throw new TypeError('ports unavailable');
    }
    const hasPortFilter = ports && 0<ports.length;
    // @ts-ignore
    (this.ports)
      .filter((port:MessagePort, portIndex:number)=>!hasPortFilter 
        || ports.includes(port) 
        || ports.includes(portIndex))
      .forEach((port:MessagePort) => port.postMessage(message, transfers));
  }

  /**
   * 
   */
  protected get name() { return workerSelf.name }

  protected close() { 
    if(!this.discardPortSaveOnConnect) {
      // close all ports before closing the worker
      // @ts-ignore
      this.ports.forEach((port)=>port.close());
    }
    return workerSelf.close() 
  }
}







/**
 * Foreground (Browser side)
 */

/**
 * @core register the SharedWorker at foreground. type "module" at default
 * @param location 
 * @param options 
 * @returns 
 */
export function register(
  location:string|URL, 
  options?:string|RegistrationOption, 
) {
  const worker = new SharedWorker(
    locateUrl(location),
    (options || { type: 'module' }),
  );

  // append async post method
  Object.defineProperty(worker, 'post', {  value: forwardOnce(worker.port) });
  // register events: shared worker client itself
  registerEventHandler(worker, 'onError', options);
  // register events: shared worker port
  registerEventHandler(worker.port, 'onMessage', options);
  registerEventHandler(worker.port, 'onMessageError', options);

  // @ts-ignore
  if(!(options?.noAutoStart)) {
    worker.port.start();
  }
  return worker;
}
