import { urlize, extract, addHandlersOf } from "../common";
import type { ForegroundSharedWorker, SharedWorkerForegroundDeterminant } from "./types";


function appendWorkerHandlers(worker:SharedWorker, options?:SharedWorkerForegroundDeterminant) {
  return addHandlersOf(worker, Object.assign({
    onError: console.error,
    onMessageError: console.error,
  }, options));
}

function buildSharedWorkerProperties(worker:SharedWorker) {
  return {
    post: {
      value(message:any, transfers?:any) { return worker.port.postMessage(message, transfers); }
    },
    close: {
      value() { return worker.port.close(); }
    }
  }
}

export function registerSharedWorker (location:string|URL, options:SharedWorkerForegroundDeterminant={}):ForegroundSharedWorker {
  const workerOptions = extract(options ?? {}, { 
    name: undefined,
    credential: undefined,
    type: undefined,
    extendedLifetime: undefined, 
    sameSiteCookies: undefined 
  });
  const worker = new SharedWorker(urlize(location), workerOptions);
  appendWorkerHandlers(worker, options);

  // initialize the port connection
  worker.port.start();

  return Object.defineProperties(worker, buildSharedWorkerProperties(worker)) as ForegroundSharedWorker;
}