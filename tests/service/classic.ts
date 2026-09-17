// message handler

const post = (clientId:string, message:any, transfers?:any) => {
  self.clients.get(clientid).postMessage(message, transfers);
}

self.addEventListener('message', ({data, source})=>{
  // post(source.id, data);
  source.postMessage(data);
  // self.postMessage(data);
});

self.addEventListener('activate', ({data, source})=>{
  // post(clientId, data);
  // self.postMessage(data);
  source.postMessage(data);
});