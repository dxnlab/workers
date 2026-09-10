import { addHandlersOf } from "../common"
import type { SharedWorkerBackgroundDeterminant } from "./types"

export function createSharedWorker(self:any, definition:SharedWorkerBackgroundDeterminant) {
  return addHandlersOf(self, definition);
}