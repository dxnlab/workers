/** legacy exports */
self.addEventListener('message', ({data})=>{
  console.log(`[ECHO][Legacy] received:`, {data});
  // post back
  self.postMessage(data);
});