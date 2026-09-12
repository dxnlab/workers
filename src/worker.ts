/**
 * Worker single file module
 */

import { 
  decoratorOn, 
  forwardOnce, 
  listDecoratedOns, 
  locateUrl, 
  registerEventHandler, 
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

export class BaseScope extends WorkerGlobalScope {

  protected readonly post:(message:any, transfers?:any)=>Promise<unknown>
  
  constructor() {
    super();
    this.post = forwardOnce(workerSelf);
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
  protected postMessage(message:any, transfers?:any) { return workerSelf.postMessage(message, transfers) }
  protected cancelAnimationFrame(id:number) { return workerSelf.cancelAnimationFrame(id) }
  protected requestAnimationFrame(callback:FrameRequestCallback) { return workerSelf.requestAnimationFrame(callback) }
}



export type RegistrationOption = WorkerOptions & {
  onError?: EventListener,
  onMessage?: EventListener,
  onMessageError?: EventListener,
};



/**
 * @core register the worker at foreground. type "module" at default
 * @param location 
 * @param options 
 * @returns 
 */
export function register(location:string|URL, options?:RegistrationOption) {
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
  return worker;
}