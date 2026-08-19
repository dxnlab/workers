import { shallowReactive, provide, type App, type InjectionKey } from 'vue';
import {
  registerWorker,
  registerSharedWorker,
  registerServiceWorker,
} from './index'
import type { 
  WorkerOptions, 
  SharedWorkerOptions, 
  ServiceWorkerOptions,
  ServiceWorkerDXN
} from './types';
import { getContainer } from './service';

type VueProvideKey = string|number|InjectionKey<unknown>

const providing = (key:VueProvideKey, value:any, app?:App) => {
  if(app) {
    app.provide(key, value);
  } else {
    provide(key, value);
  }
}

/**
 * provide worker instance
 */
export function provideWorker(
  key:VueProvideKey,
  location:string|URL, 
  options?:WorkerOptions,
  app?:App
) {
  const worker = registerWorker(location, options);
  providing(key, worker, app);
}

export function provideSharedWorker(
  key:VueProvideKey,
  location:string|URL,
  options?:SharedWorkerOptions,
  app?:App
) {
  const worker = registerSharedWorker(location, options)
  providing(key, worker, app);
}

export function provideServiceWorker(
  key:VueProvideKey,
  location:string|URL,
  options?:ServiceWorkerOptions,
  app?:App
) {
  const container = getContainer(options);
  const context = shallowReactive<{
    container: ServiceWorkerContainer,
    worker?:ServiceWorkerDXN,
  }>({
    container,
    worker: undefined,
  });
  providing(key, context, app);
  registerServiceWorker(location, options, container)
    .then((serviceWorker:ServiceWorkerDXN)=>{ 
      // update service worker later
      context.worker = serviceWorker; 
    });
}