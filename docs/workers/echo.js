// pong back the ping message
export default addEventListener('message', ({data})=>{
  self.postMessage(data);
});