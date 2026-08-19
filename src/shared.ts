import { urlize, extract } from "./common";
import type { SharedWorkerDXN, SharedWorkerOptions } from "./types";

function appendWorkerHandlers(worker:SharedWorker, options?:SharedWorkerOptions) {
  worker.addEventListener('error', options?.onError || console.error);
  worker.port.addEventListener('messageerror', options?.onMessageError || console.error);
  if(options?.onMessage) {
    worker.port.addEventListener('message', options.onMessage);
  }
  return worker;
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

export default function (location:string|URL, options:SharedWorkerOptions={}):SharedWorkerDXN {
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

  return Object.defineProperties(worker, buildSharedWorkerProperties(worker)) as SharedWorkerDXN;
}