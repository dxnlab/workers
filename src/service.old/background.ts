import { addHandlersOf } from "../common";
import type { ServiceWorkerBackgroundDeterminant } from "./types";

export function createServiceWorker(self:any, options:ServiceWorkerBackgroundDeterminant){
  addHandlersOf(self, options);
}