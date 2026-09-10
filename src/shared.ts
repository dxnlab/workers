import { 
  decoratorOn, 
  forwardOnce, 
  listDecoratedOns, 
  locateUrl, 
  WorkerGlobalScope, 
  workerSelf,
} from "./base";
import type { DedicatedWorkerEvent } from "./worker";

export type SharedWorkerEvent = DedicatedWorkerEvent
  | 'connect';

const SharedWorkerPortEvent = ['message', 'messageerror'] as Array<SharedWorkerEvent>;

function _listPorts(context:DecoratorContext):MessagePort[] {
  return (context.metadata!.ports || []) as Array<MessagePort>;
}

function _savePort(context:DecoratorContext, port:MessagePort) {
  context.metadata!.ports = _listPorts(context).concat([port]);
}

function _removePort(context:DecoratorContext, port:MessagePort) {
  context.metadata!.ports = _listPorts(context).filter((p)=>p!=port);
}

function assignPortsProperty(target:any, context:DecoratorContext) {
  // when "do not use ports" set, stop.
  if(target?.discardPortSaveOnConnect) {
    return;
  }


  // saving port to later broadcast
  Object.defineProperties(target, {
    // using "ports" to save
    ports: {
      get: ()=>_listPorts(context),
      set: (port:MessagePort) => _savePort(context, port),
    },
  });
}

function appendDefaultOnConnect(target:any, context:DecoratorContext) {
  // when option suppressed, stop here.
  if(target?.suppressDefaultOnConnectListener) {
    return;
  }

  // port event listeners to be set on the default connect
  const portEvents = listDecoratedOns<SharedWorkerEvent>(context)
        .filter(({ event })=>SharedWorkerPortEvent.includes(event));

  // default on connect listener
  on('connect')
  (function defaultOnConnect(event:any) {
    // find the port out of event
    const port = Array.from(event.ports).shift() as MessagePort;
    // const port = event.ports[0];
    // save port for broadcast
    if(!target?.discardPortSaveOnConnect) {
      target.ports = port;
    }

    // add 'post' method
    Object.defineProperty(port, 'post', { value: forwardOnce(port) });

    // append default port events
    portEvents!.forEach(({event, listener}:any)=>{
      port.addEventListener(event, (event)=>{
        // force update the "port" data.
        event.port = event.port || port;
        listener.apply(target, [event]);
      });
    });

    // remove the port from the list when closing
    if(!target?.suppressOverrideRemoveOnClose) {
      const baseClose = port.close;
      port.close = ()=>{
        baseClose();
        _removePort(context, port);
      }
    }
    // start the port
    if(!target?.suppressPortStartOnConnect) {
      port.start();
    }
  }, context);
}


export function sharedWorker(cls:any, context:DecoratorContext) {
  context.addInitializer(()=>{
    const target = new cls;
    // mixin "ports" property
    assignPortsProperty(target, context);
    // add default on connect bubbling event handle
    appendDefaultOnConnect(target, context);
    // binding listeners
    bindingMetaListeners(target, context);
    // test
    Object.defineProperty(cls, 'instance', { get() { return target } });
  });
}

function bindingMetaListeners(target:any, context:DecoratorContext) {
  listDecoratedOns<SharedWorkerEvent>(context)
    // port events would be established on connect
    .filter(({ event })=>!SharedWorkerPortEvent.includes(event))
    .forEach(({ event, listener })=>{
      workerSelf.addEventListener(event, listener.bind(target));
    });
}

export const on = decoratorOn<SharedWorkerEvent>;

export function register(location:string|URL, options?:string | WorkerOptions, suppressAutoStartPort:boolean=false) {
  const worker = new SharedWorker(
    locateUrl(location),
    (options || { type: 'module' }),
  );
  Object.defineProperty(worker, 'post', {  value: forwardOnce(worker.port) });
  if(!suppressAutoStartPort) {
    worker.port.start();
  }
  return worker;
}

export class SharedWorkerBase extends WorkerGlobalScope {

  public readonly post:(message:any, transfers?:any, ...ports:(MessagePort|number)[])=>Array<Promise<unknown>>;

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
    
    // setup post method
    this.post = !this.discardPortSaveOnConnect 
    // @ts-ignore
      ? ((message:any, transfers?:any, ...ports:(MessagePort|number)[]) => this.ports!
        .filter((port:MessagePort, pindex:number)=>ports.length<=0 || ports.includes(port) || ports.includes(pindex))
        // @ts-ignore
        .map((port:MessagePort)=>port.post!(message, transfers))).bind(this)
      : ()=>{ throw new TypeError('ports unavailable') };
  }

  /**
   * 
   */
  protected get name() { return workerSelf.name }

  protected close() { return workerSelf.close() }
}