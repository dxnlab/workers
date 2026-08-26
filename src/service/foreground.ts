import { urlize, extract } from "../common";
import type { ForegroundServiceWorker, ServiceWorkerForegroundDeterminant } from "./types";

export function getContainer(
  handlers?:{
    onChange?:EventListener,
    onMessage?:EventListener,
    onMessageError?:EventListener
  },
  baseContainer?:ServiceWorkerContainer
):ServiceWorkerContainer {
  const container = baseContainer || globalThis.navigator.serviceWorker;
  if(handlers?.onChange) {
    container.addEventListener('controllerchange', handlers.onChange);
  }
  if(handlers?.onMessageError) {
    container.addEventListener('messageerror', handlers.onMessageError);
  }
  if(handlers?.onMessage) {
    container.addEventListener('message', handlers.onMessage);
  }
  return container;
}

export async function registerServiceWorker (location:string|URL, options?:ServiceWorkerForegroundDeterminant, baseContainer?:ServiceWorkerContainer):Promise<ForegroundServiceWorker> {
  const workerOption = extract(options ?? {}, {
    scope: undefined,
    type: undefined,
    updateViaCache: undefined,
  });
  const container = getContainer(workerOption, baseContainer);
  const registration = await container.register(urlize(location), workerOption);
  const { active, installing, waiting } = registration;
  const worker = active || waiting || installing;

  // when onStateChange event listener required
  if(options?.onStateChange) {
    worker?.addEventListener('statechange', options.onStateChange);
  }
  worker?.addEventListener('error', options?.onError || console.error);

  return Object.defineProperties(worker, {
    post: {  value(message:any, options?:any) { return worker?.postMessage(message, options) } },
  }) as ForegroundServiceWorker;
}