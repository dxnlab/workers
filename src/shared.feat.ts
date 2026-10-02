import { decoratorOn, forwardOnce, listDecoratedOns, parseEventType, workerSelf } from "./base";
import type { SharedWorkerEvent, SharedWorkerOptions } from "./shared.types";
import type { HandlerEntries } from "./types";

export const SharedWorkerPortEvent = ['message', 'messageerror'] as string[];

export function bindingMetaListeners(target:any, context:DecoratorContext) {
  listDecoratedOns<SharedWorkerEvent>(context)
    // port events would be established on connect
    .filter(({ event })=>!SharedWorkerPortEvent.includes(event))
    .forEach(({ event, listener })=>{
      workerSelf.addEventListener(event, listener.bind(target));
    });
}

export function partitionEventHandlers(handlers:SharedWorkerOptions) {
  const ports:HandlerEntries = [];
  const workers:HandlerEntries = [];
  Object.entries(handlers).forEach((entry)=>{
    const [event, handler] = entry;
    const etype = parseEventType(event);
    if(SharedWorkerPortEvent.includes(etype)) {
      ports.push([etype, handler as EventListener]);
    } else {
      workers.push([etype, handler as EventListener]);
    }
  });
  return { ports, workers };
}

/**
 * 
 * @param ports 
 * @param workers 
 */
export function appendPortEventsOnConnect(ports:HandlerEntries, workers:HandlerEntries) {
  if(0<ports?.length) {
    workers.push([
      'connect', (ev:any)=>{
        const thePort = Array.from(ev.ports).shift() as MessagePort;
        ports.forEach(([event, handler])=>{
          thePort.addEventListener(event, handler);
        });
      }
    ]);
  }
}


function _listPorts(context:DecoratorContext):MessagePort[] {
  return (context.metadata!.ports || []) as Array<MessagePort>;
}

function _savePort(context:DecoratorContext, port:MessagePort) {
  context.metadata!.ports = _listPorts(context).concat([port]);
}

function _removePort(context:DecoratorContext, port:MessagePort) {
  context.metadata!.ports = _listPorts(context).filter((p)=>p!=port);
}

export function assignPortsProperty(target:any, context:DecoratorContext) {
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

const appendOn = decoratorOn<SharedWorkerEvent>;

export function appendDefaultOnConnect(target:any, context:DecoratorContext) {
  // when option suppressed, stop here.
  if(target?.suppressDefaultOnConnectListener) {
    return;
  }

  // port event listeners to be set on the default connect
  const portEvents = listDecoratedOns<SharedWorkerEvent>(context)
        .filter(({ event })=>SharedWorkerPortEvent.includes(event));

  // default on connect listener
  appendOn('connect')
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
