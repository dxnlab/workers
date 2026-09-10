/**
 * 
 */
// @ts-ignore
const total = (values:any[], operation=(left,right)=>left+right, init=0)=>values.reduce(operation, init);

self.addEventListener('connect', ({ports}:any)=>{
  console.log('on connected', ports);
  const port = ports[0] as MessagePort;
  
  port.addEventListener('message', ({data})=>{
    const dataArray = Array.from(data);
    const summation = total(dataArray);
    console.log('processed', {
      input: data,
      result: summation,
    })
    // broadcast back its summation
    port.postMessage(summation);
  });
  port.start();
});