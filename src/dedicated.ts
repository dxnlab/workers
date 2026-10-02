import { 
  decoratorOn, 
  forwardOnce,
  locateUrl, 
  parseEventType, 
  registerEventHandler, 
  WorkerGlobalScope, 
  workerSelf, 
} from "./base";
import { bindingMetaListeners } from "./dedicated.feat";
import type { 
  ClassicWorkerOption, 
  DedicatedWorkerEvent, 
  RegisteredWorkerGlobalScope, 
  RegistrationOption 
} from "./dedicated.types";

/**
 * Dedicated Worker
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */


/**
 * Background (Worker procedure side)
 */

// [classic] 
// export createWorker({ onMessage: (ev)=>void })

/**
 * @core classic mode worker declaration function
 * @param handlers { eventType: listenerFunction } object that handles each events
 * @param scope background basescope that defaults `window.self`
 * @returns WorkerGlobalScope
*/
export function createWorker(handlers:ClassicWorkerOption, scope?:EventTarget) {
  return Object.entries(handlers).reduce((target, [event, handler])=>{
    const etype = parseEventType(event);
    target.addEventListener(etype, handler as EventListener);
    return target;
    // use default workerSelf when a scope has not specified
  }, scope || workerSelf);
}

// [modular] 
// @worker
// export class extends BaseScope { 
//    @on('message')
//    onMessageHandle(event) {
//        const data = event.data!;
//        /* things with message data */
//    }
// }

/**
 * 
 * @core decorator for a modular worker background
 * @param cls The target class
 * @param context Decorator context. 
 *   It takes context metadata to register event listners,
 *   Also add class initializer.
 * 
 * @caution ! MUST be created by non-parameterized `new <class>`
 *   private constructor, and/or non-optional parameters are not available.
 */
export function worker(cls:any, context:DecoratorContext) {
  /**
   * appending initializer
   */
  context.addInitializer(()=>{
    // create the single instance & bind global scoped methods into it.
    const target = new cls;

    // add event listeners that has reserved by the "on" decorator
    bindingMetaListeners(target, context);

    // testing accessor
    if(import.meta.env.DEV) {
      Object.defineProperty(cls, 'instance', {get(){ return target }});
    }
  });
}


/**
 * @core decorator for module worker event handlers.
 * @param event:DedicatedWorkerEvent that'd be processed by the worker
 * @returns 
 */
export const on = decoratorOn<DedicatedWorkerEvent>;

/**
 * @core The base class for an Worker
 *   with aliasing basescope (`window.self`) properties/methods,
 *   adds postback:(message, transfers?)=>void method.
 *   Which is optional, but recommended.
 */
export class BaseScope extends WorkerGlobalScope {  
  constructor() {
    super();
  }

  protected postback(response:any, transfers?:any) {
    workerSelf.postMessage(response, transfers);
  }

  /**
   * properties
   * @refer https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope#instance_properties
   */
  protected get name() { return workerSelf.name }

  /**
   * methods
   * 
   */
  protected close() { return workerSelf.close() }
  protected postMessage(message:any, transfers?:any) { return workerSelf.postMessage(message, transfers) }
  protected cancelAnimationFrame(id:number) { return workerSelf.cancelAnimationFrame(id) }
  protected requestAnimationFrame(callback:FrameRequestCallback) { return workerSelf.requestAnimationFrame(callback) }
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
export function register(location:string|URL, options?:RegistrationOption):RegisteredWorkerGlobalScope {
  const worker = new Worker(
    locateUrl(location), 
    Object.assign({ type: 'module' }, options || {}));

  // register handlers
  [
    'onError',
    'onMessage',
    'onMessageError',
  ].forEach((eventKey)=>{
    registerEventHandler(worker, eventKey, options);
  });
  Object.defineProperty(worker, 'post', { value: forwardOnce(worker) });
  return worker as RegisteredWorkerGlobalScope;
}