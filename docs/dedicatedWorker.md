# (Dedicated) Worker How to use

refer https://developer.mozilla.org/en-US/docs/Web/API/Worker

```typescript
/**
 * @example workerBackground.ts (process side)
 */
import { worker, on, DedicatedWorkerBase } from '@dxnlab/workers/worker'

@worker
class WorkerClass extends DedicatedWorkerBase {
    @on('message')
    onMessageEcho({data}) {
        console.log(`[BACK] ${data}`);
        // echo back the data
        this.postMessage(data);
    }
}
```

```typescript
/**
 * @example workerFrontend.ts (browser side)
 */
import { register } from '@dxnlab/workers/worker'
// upper worker location
import workerUrl from './workerBackground?url'

// defaults type="module", 
//  unlike common Worker constructor
const worker = register(workerUrl);

const response = await worker.post('hello, worker!');
console.log(`[BROWSER] ${response}`);
```

```bash
# consequenced console output works as:
dedicatedWorker >>> [BACK] hello, worker!
browser top     >>> [BROWSER] hello, worker!
```


## Background (Worker Script/Process) side

### Decorator `@worker`, `@on`

`@on` decorator determines which method(function) to be added as event handler. And those handlers are added to the target worker at `@worker` class initializer stage. That in return, `@worker` and `@on` both decorators are required at an worker script.

At the listener method, it can tke advantage as an usual instance method/properties such as:

```typescript
// ...
protected get foo() { return 'foo' }

protected concatenate(...values) {
    return values.map((v)=>v.toString()).join('');
}

@on('message')
appendFoo({data}) {
    // build a concatenated message with 
    //  the instance property & method
    const message = this.concatenate(data, this.foo);
    // send those back
    this.postMessage(message);
    // which is a simple alias of the globalScope:
    // postMessage(message);
}

// ...
```

### DedicatedWorkerBase class

**Restriction**

- **Blank constructor**: A worker class **MUST** be available `new <class>`, that is:
  - private constructor ***NOT ALLOWED***
  - parameterized constructor ***NOT AVAILABLE***

**Recommand**

- *Export the class*: The worker class does not need to be exported, however to avoid unused type warning, it's recommended to export the worker class

- *Extend `DedicatedWorkerBase` class*: It is not a required option to extend the base class provided, can simple as:
```typescript
import { worker, on } from '@dxnlab/workers/worker'

@worker
export class WorkerClass /* NO INHERITANCE */ {
    echoBack(data) {
        // Without inheritance,
        // It should perform any instance-wrapped global scope features.
        globalThis.self.postMessage(data);

    }

    @on('message')
    doSomethingAtMessage(event) {
        // It can not use instance-wrapped features,
        // but the instanciation advantages are yet alive:
        this.echoBack(event.data!);
    }

}
```

### Foreground (browser) registration

- It converts given location (string or URL, 1st parameter) into url
- It defaults type="module" at `Worker` constructor
- It appends a single request - response promise "post" async method

```typescript
import { register } from '@dxnlab/workers/worker'
import dedicatedWorkerUrl from 'worker?url'

const worker = register(dedicatedWorkerUrl);
const responsedMessage = await worker.post(/* message here */);
// ...
```

```typescript
/* which is equivalent to below: */
const worker = new Worker(
  new URL(dedicatedWorkerUrl, import.meta.url),
  { type: 'module' }
);
const { promise, resolve, reject } = Promise.withResolvers();
worker.addEventListener('message', resolve, { once: true });
worker.addEventListener('error', reject, { once: true });
worker.addEventListener('messageerror', reject, { once: true });
worker.postMessage(/* message here */);

const responsedMessage = await promise;
// ...
```

### Detailed Properties/Methods

**Instance Wrapped Properties/Methods**

>  - https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope
>  - https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope


- properties
  - WorkerGlobalScope
    - caches:CacheStorage
    - crossOriginIsolated:boolean
    - crypto:Crypto
    - fonts:FontFaceSet
    - indexedDB:IDBFactory
    - isSecureContext:boolean
    - location:WorkerLocation
    - navigator:WorkerNavigator
    - origin:string
    - performance:Performance
    - scheduler:Scheduler
    - trustedTypes:TrustedTypePolicyFactory
  - DedicatedWorkerGlobalScope
    - name?:string
- methods
  - WorkerGlobalScope
    - atob(encodedData:byte[]):string throws InvalidCharacterError
    - btoa(stringToEncode:string):byte[] throws InvalidCharacterError
    - clearInterval(intervalId:number):void
    - clearTimeout(timeoutId:number):void
    - createImageBitmap:Promise<ImageBitmap>
      - createImageBitmap(image:ImageSource)
        - ImageSource: (one in)
          - HTMLImageElement
          - SVGImageElement
          - HTMLVideoElement
          - HTMLCanvasElement
          - Blob
          - ImageData
          - ImageBitmap
          - OffscreenCanvas
          - VideoFrame
      - createImageBitmap(image:ImageSource, options:ImageOptions)
        - ImageOptions: (object with properties as)
          - imageOrientation:'from-image' | 'flipY' | 'none'
          - premultiplyAlpha:'none' | 'premultiply' | 'default'
          - colorSpaceConversion: 'none' | 'default'
          - resizeWidth: bigint
          - resizeHeight: bigint
          - resizeQuality: 'pixleated' | 'low' | 'medium' | 'high'
      - createImageBitmap(image:ImageSource, sx:number, sy:number, sw:number, sh:number)
      - createImageBitmap(image:ImageSource, sx:number, sy:number, sw:number, sh:number, options:ImageOptions)
    - dump(message:string):void *non-standard* *deprecated*
    - fetch(resource:string|URL|Request, options?:RequestInit):Promise<Response> throws AbortError, NotAllowedError, TypeError
    - importScripts(...urls:TrustedScriptURL[]):void throws NetworkError, SyntaxError, TypeError *TrustedScriptURL only* 
    - queueMicrotask(callback:Function):void
    - reportError(throwable:Throwable):void throws TypeError
    - setInterval(code:Function|TrustedScript, delay?:number, ...params:any[]):number throws SyntaxError, TypeError
    - setTimeout(code:Function|TrustedScript, delay?:number, ...params:any[]):number throws SyntaxError, TypeError
    - structuredClone(value:object, options?:{transfer:Array<Transferable>}):object throws DataCloneError
  - DedicatedWorkerGlobalScope
    - close():void
    - postMessage:void
      - postMessage(message:any)
      - postMessage(message:any, tranfer:Transferable[])
      - postMessage(message:any,options:{ transfer:Transferable[] })
    - requestAnimationFrame(callback:(timestamp:DOMHighResTimeStamp)=>any):bigint throws NotSupportedError
    - cancelAnimationFrame(handle:bigint):void throws NotSupportedError
  - DedicatedWorker (@dxnlab/workers)
    - post:Promise<any>
      - post(message:any)
      - post(message:any, transfer:Transferable[])
      - post(message:any, options:{ transfer:Transferable[] })

## Foreground (Browser) side

> - https://developer.mozilla.org/en-US/docs/Web/API/Worker

- properties
  - EventTarget
  - Worker
  - (@dxnlab/workers)

- methods
  - EventTarget
  - Worker
  - (@dxnlab/workers)


### registration

