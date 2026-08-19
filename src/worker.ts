import { urlize, extract } from "./common";
import type { WorkerDXN, WorkerOptions } from './types'

function appendWorkerHandlers(worker:Worker, options?:WorkerOptions) {
  worker.addEventListener('error', options?.onError || console.error);
  worker.addEventListener('messageerror', options?.onMessageError || console.error);
  
  if(options?.onMessage) {
    worker.addEventListener('message', options.onMessage);
  }
  return worker;
}

function buildWorkerProperties(worker:Worker) {
  return {
    post: {
      value(message:any, transfers?:any) { return worker.postMessage(message, transfers); }
    },
    close: {
      value(){ return worker.terminate(); }
    }
  };
}

/**
 * @core build a worker instance
 * @param location 
 * @param options 
 * @returns 
 */
export default function(location:string|URL, options?:WorkerOptions):WorkerDXN {
  const workerOption = extract(options ?? {}, {
    name: undefined, 
    credential: undefined, 
    type: undefined,
  });
  const worker = new Worker(urlize(location), workerOption);
  // onError handler
  appendWorkerHandlers(worker, options);
  
  /**
   * appending properties
   */
  return Object.defineProperties(worker, buildWorkerProperties(worker)) as WorkerDXN;
}