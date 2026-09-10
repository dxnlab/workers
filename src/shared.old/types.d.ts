import type { ForegroundWorkerBase, ForegroundWorkerDeterminantBase } from "@/types";
import type { WorkerBackgroundDeterminant } from "@/worker.old/types";


export type ForegroundSharedWorker = SharedWorker & ForegroundWorkerBase;

export type SharedWorkerForegroundDeterminant = ForegroundWorkerDeterminantBase & {

};

type SharedWorkerGlobalScope = WindowOrWorkerGlobalScope & {
  /** SharedWorker specific scope */
  readonly name:string,
  close:()=>void,
}
export type BackgroundSharedWorker = SharedWorkerGlobalScope & {
}

export type SharedWorkerBackgroundDeterminant = WorkerBackgroundDeterminant & {
  onConnect?: EventListener,
}