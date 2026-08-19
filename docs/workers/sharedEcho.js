const connectedPorts = [];
addEventListener('connect', function(e) {
    const port = e.ports[0];
    // save ports
    connectedPorts.push(port);
    port.addEventListener('message', ({data})=>{
        port.postMessage(data);
    });
    port.start();
});