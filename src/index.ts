export {
  // background class decorator
  worker,
  // background method handling registration
  on as onWorker,
  // background class alias base
  BaseScope as WorkerBaseScope,
  // background classic determination
  createWorker,
  // foreground
  register as registerWorker,
} from './dedicated';

export {
  // background class decorator
  sharedWorker,
  // background method handling registration
  on as onSharedWorker,
  // background class alias base
  BaseScope as ShareWorkerBaseScope,
  // background classic determination
  createSharedWorker,
  // foreground
  register as registerSharedWorker,
} from './shared'

export {
  // background class decorator
  serviceWorker,
  // background method handling registration
  on as onServiceWorker,
  // background class alias base
  BaseScope as ServiceWorkerBaseScope,
  // background classic determination
  createServiceWorker,
  // foreground
  register as registerWorker,
} from './service';

