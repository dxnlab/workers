import { 
    registerWorker,
    registerSharedWorker,
    registerServiceWorker,
    getServiceWorkerContainer,
} from "../src";

const worker = registerWorker('/workers/echo.js', { 
    type: 'module',
    onError: console.error,
    onMessageError: console.warn,
    onMessage: (event)=>{
        console.log('[WORKER] pong back', event);
    }
});
const shared = registerSharedWorker('/workers/sharedEcho.js', {
    onError: console.error,
    onMessageError: console.warn,
    onMessage: (event)=>{
        console.log('[SHARED] pong back', event);
    }
});

const serviceContainer = getServiceWorkerContainer({
    onMessage(ev) {
        console.log('[SERVICE] Echo state changed', ev);
    }
});
const serviced = await registerServiceWorker('/workers/serviceEcho.js');

worker.post('ping');
shared.post('pong');
serviced.post({ping: 'pong'});
