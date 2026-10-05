# @dxnlab/workers

worker wrapper, especially focused to be used with `vite`

There're major 3 types of workers as of NOW (2026.Oct)

- [`(dedicated) worker`](./dedicated.md)
- [`sharedWorker`](./shared.md)
- [`serviceWorker`](./service.md)

plus marginal sub category of `worklet` and `(queued) microtask`

The library, to ease using workers in practice.

## Purpose & Limitations

The library, `@dxnlab/workers` is to have fine-grained worker modules within web developments. The (relatively) new ES standard, workers, has larger potential at web development though yet widely used. Also, those codes aren't so complicated, however, soon it can be messy because of fore-back ground inter communications.

With `@dxnlab/workers`, One can easily build up an `Worker`, clearly separate fore & back, having a classic OOP perspective.

It'll cover major 3 types of workers, `dedicated`, `shared`, `service` workers accordingly. As of internal feature of those, it can spawn a sub-worker of any types, either schedule micro tasks. However, `Worklet` is out of scope right at this moment (2026.Oct.) to sustain certain level of generality.

Also, the library acts as a structure-wrapper; Will NOT cover

- A new featuers takes advantage of standard workers;
- Dev, test & package management like [`Vite-PWA`](https://vite-pwa-org.netlify.app/)

Any worker-advant features will be laid on yours. Cheers.


## QuickStart

A single (type) worker has 
- The worker's independent event loop scope; `Background`
- A connector within the page's script, to communicate with the background worker, which is ran over the page's scope; `Foreground`


So the library supports both side, as:

- Declare `background` worker module simply with a wrap.
- register `foreground` connector with the worker.

Detailed description can be found on each worker types.

### Install

Simply add `@dxnlab/workers` library via `npm`

```bash
npm i @dxnlab/workers
```

And if pnpm:

```bash
pnpm add @dxnlab/workers
```


### (dedicated) Worker

Details: [`(dedicated) Worker`](./dedicated.md)

#### (dedicated) Worker: Background

```typescript
/**
 * @file dedicatedEchoWorker.ts
 * @description When it get a message, mirror it back to the sender.
 **/ 

import { worker, on, BaseScope } from '@dxnlab/workers/dedicated'

@worker
export class EchoWorker extends BaseScope {
    @on('message')
    echoOnMessage({data}:any) {
        // 
        this.postback(data);
    }
}
```

#### (dedicated) Worker: Foreground

```typescript
/**
 * @file main.ts
 * @description in the web-page included js code that to be processed on a browser window scope.
 */

/* ... */
import { register } from '@dxnlab/workers/dedicated'

// assuming when using vite to compile
// get the worker-source code url
import dedicatedEchoWorkerUrl from './dedicatedEchoWorker?url'


const echoWorker:Worker = register(dedicatedEchoWorkerUrl, {
    // when the foreground worker get a message.
    // in this setting, 
    // the background worker's response will trigger this handler.
    onMessage({data}:any) { console.log('response', {data,}) },
    // handling message (parsing) errors
    onMessageError: console.warn,
    // any errors
    onError: console.error,
});

// send the first message
const response = await echoWorker.post('hello');

// will be:
// console.log$ 'response', {data: 'hello'}
// response = 'hello'
```


### SharedWorker

#### SharedWorker: Background

```typescript
/**
 * @file sharedEchoWorker.ts
 * @description When it gets a message, it responses:
 *   - mirror it back to the origin port (foreground)
 *   - broadcast message to 'update'
 **/ 

import { sharedWorker, on, BaseScope } from '@dxnlab/workers/shared'

export class EchoWorker extends BaseScope {
    @on('message')
    handleOnMessage(event:any) {
        const data = event.data;
        // mirror it back
        this.postback(event, data);
        // broadcast update
        this.broadcast({ update: true, data });
    }
}
```

#### SharedWorker: Foreground

```typescript
/**
 * @file main.ts
 * @description in the web-page included js code that to be processed on a browser window scope. When it send a message to background, it gets EITHER echo to the origin AND broadcast update, as it determined at background worker on message handler.
 */

import { register } from '@dxnlab/workers/shared'

import sharedEchoWorkerUrl from './sharedEchoWorker?url'

const theSharedWorker = register(sharedEchoWorker, {
    // update handler
    onMessage({data}:any) {
        // on update broadcast.
        // If, a foreground send a message to its background,
        // it gets BOTH response and broadcast
        if(data?.update) { /* do inter-window sync */ }
        else { /* self-originated response */ }
    }
});

// send first message
await theSharedWorker.post('hello');
```


### ServiceWorker

#### ServiceWorker: Background

```typescript
/**
 * @file serviceEchoWorker.ts
 * @description echo message - at service worker level.
 */

import { serviceWorker, on, BaseScope } from '@dxnlab/workers/service'

export class extends BaseScope {
    @on('message')
    onMessageHandler(event:ExtentableMessageEvent) {
        const data = event.data;
        // post back
        this.postback(event, data);
    }
}
```

#### ServiceWorker: Foreground

```typescript
/**
 * @file main.ts
 * @description in the web-page included js code that to be processed on a browser window scope, in a service worker level.
 */

import { register } from '@dxnlab/workers/service';

import serviceWorkerUrl from './serviceEchoWorker?url';

// Since a service worker registration works in async,
// it needs to await active service worker to be ready.
const theServiceWorker = await register(serviceWorkerUrl, {
    scope: './',
    onMessage(event:ExtendableMessageEvent) {
        
    },
});

// post a message into background, which will echo back.
await theServiceWorker.post('hello');

```

### Subsidiaries

#### microTask

All worker types can queue a microtask:
- [x] dedicated worker
- [x] sharedWorker
- [x] serviceWorker

```typescript
import { worker, on, BaseScope } from '@dxnlab/worker/dedicated'

export class extends BaseScope {

    private buildMicroTaskOf(data):()=>any {
        return ()=>{
            /* do things with the data */
            return true;
        };
    }

    on('message')
    queueMicrotaskThenResponse({data}) {
        // when, a message data specify "queue"
        // Which determined at foreground
        if(data.queue) {
            // microtask definition
            const callbackFunction = this.buildMicroTaskOf(data);

            // queue micro task and get its response
            // rs set to be true
            const rs = await this.queue(callbackFunction);
            this.postback(rs);
        }
    }
}
```

#### spawn subworker

All worker types, (but to be registered as a module) can spawn a subworker.
A subworker to be a classic-loaded, dedicated worker.

- [x] dedicated worker
- [x] sharedWorker
- [x] serviceWorker

```typescript

import { worker, on, BaseScope, register as spawnWorker } from '@dxnlab/worker/dedicated'
import { register as spawnSharedWorker } from '@dxnlab/worker/shared'

import dedicatedSubWorkerLocation from './a.dedicated.sub.worker?url';
import sharedSubWorkerLocation from './a.shared.sub.worker?url';

export class extends BaseScope {
    protected dedicatedSub:Worker;
    protected sharedSub:SharedWorker;
    /**
     * @caution the worker class constructor MUST be anonymized,
     *  That can proceed `new <classname>`;
     */
    constructor() {
        this.dedicatedSub = spawnWorker(dedicatedSubWorkerLocation);
        this.sharedSubWorkerLocation = spawnSharedWorker(sharedWorkerLocation);
    }
}

```

#### Worklet

> TBD: Since the Worklet is in experiment mode yet not widely known,
>  And also fairly restricted usages.

refer https://developer.mozilla.org/en-US/docs/Web/API/Worklet



## Be Simple. Be Clear.

***Feed forward***

Before adopting decorator, former `@dxnlab/vite-workers` were rather simple wrapper align events to any foreground registerations; Which, yet alive at classic worker generators.

```typescript
/**
 * @file classic.dedicated.echo.ts
 */
import { createWorker } from '@dxnlab/workers/dedicated';

export createWorker({
    onMessage({data}) { /* ... */ }, 
    onMessageError() { /* ... */ }, 
    onError() { /* ... */ },
});
```

Which are sustained but neglected at this moment, because this way, any event handler get restricted to be binded to a single listener, only.

Suppose multi-level command message handler is required:

```typescript
/**
 * @file complicated.worker.ts
 */
import { 
    // classical generator
    createSharedWorker, 
    // concurrent decorator
    sharedWorker, on, BaseScope
} from '@dxnlab/workers/shared';

// when a classical worker ought to handle multi-commands:
export createSharedWorker({
    onMessage(event) {
        const inputData = event.data!;
        const command:string = inputData.command!;

        if(caseA == command) { /* ... */ }
        if(caseB == command) { /* ... */ }
        if(caseC == command) { /* ...  */}
    }
})

// the same works, can be "modular"
export class extends BaseScope {
    @on('message')
    onMessageCaseA(event) {
        this.onMessageCaseGuards(
            // caseA
            ()=> caseA == event.data?.command,
            // do with event
            ()=> { /* ... */ },
        );
    }

    @on('message')
    onMessageCaseB(event) {
        this.onMessageCaseGuards(
            // caseB
            ()=> caseB == event.data?.command,
            // do with event
            ()=> { /* ... */ },
        );
    }

    @on('message')
    onMessageCaseC(event) {
        this.onMessageCaseGuards(
            // caseC
            ()=> caseC == event.data?.command,
            // do with event
            ()=> { /* ... */ },
        );
    }

    onMessageCaseGuards(
        condition:()=>boolean,
        proceed:Function
    ) {
        // do not proceed when the case doesn't get matched.
        if(condition()) {
            proceed();
        }
    }
} 
```

***The reason exporting names are alike:***

Even though the library itself is a tiny, and there are certain cases mix-and-match various types of workers at once, but most general cases - especially in any worker global scope - there's no typical case mixing 2 or more types of workers. If it is determined to be a dedicatedWorker, it IS A DedicatedWorker, nothing else.

```typescript
/**
 * @so this will never happen
 * @because Can you tell which type of worker this is?
 */
import { 
    worker, 
    on as onWorker, 
    BaseScope as DedicatedWorkerBase 
} from '@dxnlab/workers/dedicated';

import {
    sharedWorker,
    on as onShared,
    BaseScope as SharedWorkerBase
} from '@dxnlab/workers/shared';

@worker
export class DedicatedWorker extends DedicatedWorkerBase {
    @onWorker('message')
    doSomethingWith({data}) { }
}

@sharedWorker
export class SharedWorker extends SharedWorkerBase {
    @onShared('message')
    doSomethingWith({data}) { }
}
```

Considering the fact, it gets aligned/organized; to reduce complexities; any function that shares same meaning at there own context, it's natually share the same name by its aspect. So its all the same `on`, `BaseScope` and `register` for each worker types.

Only valid case will be sub-worker registrations, so this simple:

```typescript
import { serviceWorker, on, BaseScope } from '@dxnlab/workers/service';
// here, all the names.
import {
    registerWorker,
    registerSharedWorker,
    registerServiceWorker,
} from '@dxnlab/workers';

@serviceWorker
export class RootServiceWorker extends BaseScope {
    protected dedicatedSub;
    protected sharedSub;
    protected serviceSub;

    constructor() {
        this.dedicatedSub = registerWorker(/** */);
        this.sharedSub = registerSharedWorker(/**  */);
        this.serviceSub = registerServiceWorker(/**  */);
    }
}
```