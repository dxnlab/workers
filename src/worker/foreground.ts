import { urlize, extract, addHandlersOf } from "../common";
import type { WorkerForegroundDeterminant, ForegroundWorker } from "./types";

/**
 * @core build a worker instance
 * @param location 
 * @param options 
 * @returns 
 */
export function registerWorker(
  location:string|URL, 
  options?:WorkerForegroundDeterminant):ForegroundWorker {
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
  return Object.defineProperties(worker, buildWorkerProperties(worker)) as ForegroundWorker;
}


function appendWorkerHandlers(worker:Worker, options?:WorkerForegroundDeterminant) {
  return addHandlersOf(worker, Object.assign({
    onError: console.error,
    onMessageError: console.error,
  }, options));
}

/**
 * 
 * @param worker 
 * @returns 
 */
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
