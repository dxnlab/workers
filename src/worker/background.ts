import { addHandlersOf } from "../common";
import type { WorkerBackgroundDeterminant } from "./types";


export function createWorker(self:any, definition:WorkerBackgroundDeterminant) {
  //
  return addHandlersOf(self, definition);
}