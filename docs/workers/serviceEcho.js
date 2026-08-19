self.addEventListener('installing', (ev)=>{
    console.log('service-echo installing', ev);
});
self.addEventListener('activate', (ev)=>{
    console.log('service-echo activate', ev);
});

self.addEventListener('message', (ev)=>{
    console.log('service-echo got the message', {self, ev});
    if(ev.source !== self.serviceWorker) {
        self.serviceWorker.postMessage(ev.data);
    }
});