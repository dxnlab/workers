import { on } from '../common';

/**
 * 
 * @param cls 
 * @param context 
 */
let singular:Worker|undefined;
export function worker(cls:any, context:DecoratorContext) {
  return Object.defineProperties(cls, {
    // singular instance of the worker
    get: { 
      get() {
        singular = singular || new cls(globalThis.self);
        return singular;
      }
    }
  });
}



export function onMessage(method:any, context:DecoratorContext) {
  return on('message', method, context);
}

export function onError(method:any, context:DecoratorContext) {
  return on('error', method, context);
}

export function onLanguageChange(method:any, context:DecoratorContext) {
  return on('languagechange', method, context);
}

export function onOnline(method:any, context:DecoratorContext) {
  return on('online', method, context);
}

export function onOffline(method:any, context:DecoratorContext) {
  return on('offline', method, context);
}

export function onRejectionHandler(method:any, context:DecoratorContext) {
  return on('rejectionhandled', method, context);
}

export function onSecurityPolicyViolation(method:any, context:DecoratorContext) {
  return on('securitypolicyviolation', method, context);
}

export function onUnhandledRejection(method:any, context:DecoratorContext) {
  return on('unhandledrejection', method, context);
}