# vite-workers

worker add-on for to be used in vite

## @dxnlab/vite-workers

### (simple) Web Worker

```typescript
/** foreground - browser page side */
import { registerWorker } from '@dxnlab/workers'

/** runner on simple worker */
import simpleWorker from './worker?url'

// register & retrieve the worker
const worker = registerWorker(simpleWorker, { 
    type:'module'
    /* local error handler */
    onError: console.error,
    /* local deserializable message error */
    onMessageError: console.error,
    /* local on message */
    onMessage: (event)=>{
        // TODO: handling message FROM the worker
    }
});

// send message
worker.post({message: 'hello, world'});

// complete the worker
worker.close();
```

```typescript
/** background - worker side */
export default createWorker((messageEvent)=>{
    /** do things upon the event */
});
```

### Shared Worker

```typescript

import { registerSharedWorker } from '@dxnlab/workers'

import sharedWorker from './shared?url'

// register the worker: the port get started at registration
const worker = registerSharedWorker(sharedWorker, { 
    type: 'module',
    /* local error handler */
    onError: console.error,
    /* local deserializable message error */
    onMessageError: console.error,
    /* local on message */
    onMessage: (event:Event) => {
        // TODO:
    }
});

// send message to a port
worker.post({message: 'hello, world'});

// close the port & terminate
worker.close();
```

### Service Worker

```typescript

import { registerServiceWorker } from '@dxnlab/vite-workers'
import serviceWorker from './serviced'

const worker = await registerServiceWorker(serviceWorker, {
    // goes to registration options
    scope: '/',
    // type?: 'classic' | 'module'
    // updateViaCache?: 'all' | 'imports' | 'none'

    /**
     * common in ServiceWorkerContainer events
     *  - onChange?: 'controllerChange'
     *  - onMessage?: 'message'
     *  - onMessageError? : 'messageerror'
     **/
    onMessage: (event:Event)=>{

    }

    /**
     * to ServiceWorker instance events
     *  - onError?: 'error'
     *  - onStateChange?: 'statechange'
     */
});

// onMessageError handler get handled at ServiceWorkerContainer
globalThis.navigator.serviceWorker.addEventHandler('messageerror', console.error);
// 
```

## vue templated use

```typescript
/* vue plugin wrapper */
import {
    provideWorker,
    provideSharedWorker,
    provideServiceWorker,
} from '@dxnlab/workers/vue'

// providing Worker & Shared Worker are the same.
provideWorker(
    // keyname 
    'worker', 
    // worker script location/url
    '/worker_location', 
    // worker options
    { },
    // when app provided, it gets in app level provides.
);

// when an app level provide:
provideSharedWorker(
    'shared',
    '/shared_worker_location',
    { /* shared worker options */ },
    vueApp
);

// ServiceWorker has a shallowReactive instance
// that contains { container: ServiceWorkerContainer, worker: ServiceWorker }
// specifically, .worker instance get updated when registration completed.
provideServiceWorker(
    'serviced',
    '/service_worker_location',
    { /* service worker options */ },
    vueApp?
);


/** And it'd be used */
const worker = inject('worker');
worker.post('hello, worker');
// better not to close in a component
// worker.close();

const sharedWorker = inject('shared');
sharedWorker.post('greeting to the shared');

const serviceWorker = inject('serviced');
serviceWorker({ping: 'pong'});
```
