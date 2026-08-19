import { createContext, useState } from 'react';
import { 
  registerWorker,
  registerSharedWorker,
  registerServiceWorker,
  getServiceWorkerContainer,
} from './index';
import type { 
  ServiceWorkerOptions, 
  SharedWorkerOptions, 
  WorkerOptions 
} from './types';

export function WorkerContext(location:string|URL, options?:WorkerOptions) {
  return createContext(registerWorker(location, options));
}

export function SharedWorkerContext(location:string|URL, options?:SharedWorkerOptions) {
  return createContext(registerSharedWorker(location, options));
}

export function ServiceWorkerContext(location:string|URL, options?:ServiceWorkerOptions, baseContainer?:ServiceWorkerContainer) {
  const container = getServiceWorkerContainer(options, baseContainer);
  const [worker, workerUpdate] = useState(null);
  const context = createContext(worker);
  registerServiceWorker(location, options, container)
    // @ts-ignore
    .then(workerUpdate);
  return context;
}
