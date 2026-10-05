export {
  // background classic determination
  createWorker,
  // foreground
  register as registerWorker,
} from './dedicated';

export {
  // background classic determination
  createSharedWorker,
  // foreground
  register as registerSharedWorker,
} from './shared'

export {
  //
  getContainer,
  // background classic determination
  createServiceWorker,
  // foreground
  register as registerServiceWorker,
} from './service';
