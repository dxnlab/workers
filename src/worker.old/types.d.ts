import type { ForegroundWorkerBase, ForegroundWorkerDeterminantBase } from "@/types";

export type ForegroundWorker = Worker & ForegroundWorkerBase;

export type WorkerForegroundDeterminant = ForegroundWorkerDeterminantBase & {
};



export type BackgroundWorker = WindowOrWorkerGlobalScope & {
};

export type WorkerBackgroundDeterminant = {
  /** event handlers */
  onError?: EventListener,
  onLanguageChange?: EventListener,
  onOnline?: EventListener,
  onOffline?: EventListener,
  onRejectionHandler?: EventListener,
  onSecurityPolicyViolation?: EventListener,
  onUnhandledRejection?: EventListener,
};