/**
 * 
 */
self.addEventListener('message', ({data}:any)=>{
  self.postMessage(data);
});