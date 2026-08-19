# vite-workers

worker add-on for to be used in vite

## @dxnlab/vite-workers

### (simple) Web Worker

```typescript
import { registerWorker } from '@dxnlab/vite-workers'

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

### Shared Worker

```typescript

import { registerSharedWorker } from '@dxnlab/vite-workers'

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
    scope: '/',
    onStateChange: console.log,
    onError: console.error,
    onMessage: (event:Event)=>{

    }
});

// onMessageError handler get handled at ServiceWorkerContainer
globalThis.navigator.serviceWorker.addEventHandler('messageerror', console.error);
// 
```

## vue templated use

```typescript
import { createApp } from 'vue'
/* vue plugin wrapper */
import {
    useWorker,
    useSharedWorker,
    useServiceWorker,
} from '@dxnlab/vite-workers/vue'
import simpleWorker from './workers/simple?url'
import sharedWorker from './workers/shared?url'
import serviceWorker from './workers/servied?url'

const app = createApp({});
    .use(useWorker(simpleWorker, { 
        // this.$simpleWorker.post({ message })
        key: '$simpleWorker'
    }))
    .use(useSharedWorker(sharedWorker, {
        key: '$sharedWorker',
        type: 'module',
    }))
    .use(useServiceWorker(serviceWorker, {
        key: '$serviceWorker',
        scope: '/',
    }));

app.mount('#app');
```
