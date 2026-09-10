import {
    registerWorker,
    WorkerEvent,
} from '../src/worker';
// import decorated from './workers/deco?url';


const legacy = registerWorker('/workers/echo.js', {
    message: (event) => {
        console.log('[ECHO][Legacy] browser got', event);
    }
});
legacy.postMessage({ ping: 'pong' });

const deco = registerWorker('/workers/deco.js', {
    message: (event) => {
        console.log(`[ECHO][Deco] browser got`, event);
    }
});
deco.postMessage({ hello: 'world' });
