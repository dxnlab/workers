import { listDecoratedOns, workerSelf } from "./base";
import type { DedicatedWorkerEvent } from "./dedicated.types";

/**
 * method decorator bindings. register the method on context.metadata
 */
export function bindingMetaListeners(target:any, context:DecoratorContext) {
  listDecoratedOns<DedicatedWorkerEvent>(context).forEach(({event, listener})=>{
    workerSelf.addEventListener(event, listener.bind(target));
  })
}
