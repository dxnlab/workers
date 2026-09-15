# Dedicated Worker

Background (Worker side)

```typescript
/** 
 * @file worker.ts
 * @decorator stage3
 **/

import { worker, on, BaseScope } from '@dxnlab/workers/worker'

@worker
export class EchoWorker extends BaseScope {
    // constructor can be omitted,
    //  However, it MUST declare nonparameterized constructor
    //  to run: new <class>
    // constructor() { super() }

    @on('message')
    echoBack(event:Event) {
        // protected async postback(event:Event, message:any, transfers?:any)=>void
        // defined at BaseScope
        this.postback(event, event.data);
    }
}
```

Foreground (Browser side)

```typescript
/**
 * @file main.ts
 */

import { register } from '@dxnlab/workers/worker'
// use the upper source code with import.meta.url
import workerUrl from './worker?url'

const worker = register(workerUrl, {
    // message listener
    onMessage({data}){ console.log(`[ECHO] ${data}`)  }
    onMessageError: console.warn,
    onError: console.log,
});

/**
 * message handling
 */
const pingpong = (message:any, transfers?:any)=>new Promise((resolve, reject)=>{
    worker.addEventListener('message', ({data})=>resolve(data), {once: true});
    worker.addEventListener('messageerror', reject, { once: true });
    worker.addEventListener('error', reject, { once: true });
    worker.postMessage(message, transfers);
});

// will log `hello, world` back.
console.log(pingpong('hello, world'));

/**
 * Equivalent to the above
 */
console.log(await worker.post('hello, world'));
```

## Foreground - browser side

use `Worker` registration

```typescript
import { register } from '@dxnlab/workers/worker'

const worker:Worker = register('workerFileUrl', {
    /** new Worker constructor options */
    credentials,
    name,
    type: 'module', // "module" at default -- unlike new Worker() option.

    /** 
     * Worker event listeners to add right after instanciation
     */
    onMessage(event)=>void,
    onMessageError(event)=>void,
    /* ... */
});
```

If, the background worker guaranteed to respond a message,
It's recommended to use 

***post(message:any, transfers?:any) :Promise<type of response>***

```typescript
const response = await echoWorker.post('ping');
// i.e. background echo worker has:
//   onMessage({data})=>postMessage(data);
//   then, response === 'ping'
```


## Background (worker procedure) side


### (Best Practice) Decorated module extends BaseScope

```typescript
import { worker, on, BaseScope } from '@dxnlab/workers/worker'

/**
 * The class is not necessarily exported,
 *  it helps lint warning of unused declaration.
 */

@worker
export class Worker extends BaseScope {
    // echo back
    protected postEchoBack(event:Event) {
        const data = event?.data;
        // protected postback(event:Event, message:any, transfers?:any) :void
        this.postback(event, data);
    }

    /**
     * message handler
     */
    @on('message')
    messagehandler(event:Event) {
        // can call instance method
        this.postEchoBack(event);
    }
}
```


### Decorated module, but without BaseScope

```typescript
import { worker, on } from '@dxnlab/workers/worker'

@worker
export class Worker {

    protected extractData(event:Event) {
        return event?.data;
    }
    
    @on('message')
    messageHandler(event:Event) {
        // still, instance properties/methods can be used within handlers
        const data = this.extractData(event);

        // but when using global scope, It SHOULD BE globalThis.self not this.
        // therefore, `this.postback` on extended BaseScope will be in this:
        globalThis.self.postMessage(data);
    }
}
```

### Classical - vanila js

```javascript
/**
 * @file classicalEcho.js
 */

// use "createWorker" function instead of decorator 'worker' & 'on'
import { createWorker } from '@dxnlab/workers/worker';

createWorker({
    // 'message' event handler
    onMessage(event:Event) {
        // TODO: with event.data
    }
    // 'messageerror'  handler
    onMessageError(event:Event) { }
});
```
