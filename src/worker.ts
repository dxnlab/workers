/**
 * Worker single file module
 */

import { 
  decoratorOn, 
  forwardOnce, 
  listDecoratedOns, 
  locateUrl, 
  WorkerGlobalScope, 
  workerSelf 
} from "./base";

/**
 * Events that can be applied to the Worker
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope#events
 */
export type DedicatedWorkerEvent = 'message'
  | 'error'
  | 'languagechange'
  | 'online'
  | 'offline'
  | 'rejectionhandled'
  | 'securitypolicyviolation'
  | 'unhandledrejection'
  | 'rtctransform'


/**
 * decorator for module worker background
 * @core
 * @param cls 
 * @param context 
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
  });
}

/**
 * @core decorator bindings
 */
function bindingMetaListeners(target:any, context:DecoratorContext) {
  listDecoratedOns<DedicatedWorkerEvent>(context).forEach(({event, listener})=>{
    workerSelf.addEventListener(event, listener.bind(target));
  })
}

/**
 * @core decorator for module worker event handlers.
 * @param event 
 * @returns 
 */
export const on = decoratorOn<DedicatedWorkerEvent>;

/**
 * @core register the worker at foreground. type "module" at default
 * @param location 
 * @param options 
 * @returns 
 */
export function register(location:string|URL, options?:WorkerOptions) {
  const worker = new Worker(
    locateUrl(location), 
    Object.assign({ type: 'module' }, options || {}));
  Object.defineProperty(worker, 'post', { value: forwardOnce(worker) });
  return worker;
}

export class DedicatedWorkerBase extends WorkerGlobalScope {

  public readonly post:(message:any, transfers?:any)=>void
  
  constructor() {
    super();
    this.post = forwardOnce(worker);
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
  // @ts-ignore @multivariated
  protected postMessage() { return workerSelf.postMessage(...arguments) }
  protected cancelAnimationFrame(id:number) { return workerSelf.cancelAnimationFrame(id) }
  protected requestAnimationFrame(callback:FrameRequestCallback) { return workerSelf.requestAnimationFrame(callback) }
}