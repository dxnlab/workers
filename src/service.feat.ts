import { 
  decoratorOn, 
  listDecoratedOns, 
  parseEventType, 
  workerSelf 
} from "./base";
import type { 
  ServiceWorkerEvent, 
  ServiceWorkerListener, 
  ServiceWorkerOptions 
} from "./service.types";

export const ServiceWorkerExperimentalEvents = [
  'backgroundfetchabort',
  'backgroundfetchclick',
  'backgroundfetchfail',
  'backgroundfetchsuccess',
  'canmakepayment',
  'contentdelete',
  'paymentrequest',
  'periodicsync'
];
export const SerivceWorkerControllerEvents = [
  'error',
  'statechange',
];

export function partitionEventHandlers(handlers:ServiceWorkerOptions) {
  const controllers:Array<any> = [];
  const workers:Array<any> = [];

  Object.entries(handlers).forEach(([event, handler])=>{
    const etype = parseEventType(event);
    if(SerivceWorkerControllerEvents.includes(etype)) {
      controllers.push([etype, handler]);
    } else {
      if(ServiceWorkerExperimentalEvents.includes(etype)) {
        console.warn(`ServiceWorker event "${event}" at lab.`);
      }
      workers.push([etype, handler]);
    }
  });
  return {
    controllers,
    workers
  };
}

export function registerControllerDefaultHandler(target:any, controllers:Array<[string, ServiceWorkerListener<unknown>]>) {
  
  const handlerKey = '_controller_handler_registration';
  const presetHandler = target?.[handlerKey];
  // has controller handlers
  if(0<controllers?.length && presetHandler!=undefined) {
    // add default handler on serviceWorker activates
    target[handlerKey] = (() => {
      controllers.forEach(([etype, listener])=>{
        target.serviceWorker!.addEventListener(etype, listener);
      });
    });
    return target[handlerKey];
  } else {
    return undefined;
  }
}

export function onWorkerActivateDefaultBuilder(target:any, context:DecoratorContext) {
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

const appendOn = decoratorOn<ServiceWorkerEvent>;
export function appendDefaultWorkerActivated(target:any, context:DecoratorContext) {
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
    appendOn('activate')
    (context.metadata!.onWorkerActiveDefault as EventListener, context);
  }
}

export function bindingMetaListeners(target:any, context:DecoratorContext) {
  listDecoratedOns<ServiceWorkerEvent>(context)
    .filter(({ event })=>!SerivceWorkerControllerEvents.includes(event))
    .forEach(({ event, listener })=>{
      if(ServiceWorkerExperimentalEvents.includes(event)) {
        console.warn(`ServiceWorkerGlobalScope:${event} - experimental`);
      }
      workerSelf.addEventListener(event, listener.bind(target));
    });
}


export const resolver = (resolve:Function, reject:Function, ev:any)=>{
  const { active, waiting, installing } = ev

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


export async function getActiveServiceWorkerWhileRegistration(target:any):Promise<ServiceWorker> {
  const { promise, resolve, reject } = Promise.withResolvers();
  const { active, waiting, installing } = await target;
  try {
    if(active) { resolve(active) }
    else {
      const next = (waiting || installing);
      next.addEventListener('statechange', (ev:any)=>{
        if(ev.active) { resolve(ev.active) }
        else if(next.state === 'activated') { resolve(next); }
      });
    }
  }
  catch(ex) { reject(ex) }
  return await promise as Promise<ServiceWorker>;
}
