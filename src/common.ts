export function urlize(location:string|URL) {
  return location instanceof URL ? location : new URL(location, import.meta.url);
}

export function extract(source:{[key:string]:any}, keysWithDefault:{[key:string]:any}):object {
  return Object.entries(keysWithDefault)
    .filter(([key, _])=>Object.hasOwn(source, key) && source?.[key]!=undefined)
    .reduce((obj, [key,defaultValue])=>{
      if(source[key]!=null) {
        // @ts-ignore
        obj[key] = source[key] ?? defaultValue;
      }
      return obj;
    }, {});
}

export async function until(syncFn:Function, interval=10, timeout=1e4) {
  let _intv:number;
  const began = Date.now();
  const threshold = began + timeout;
  return new Promise((resolve, reject)=>{
    _intv = setInterval(()=>{
      // timeout
      if(Date.now() >= threshold) {
        reject(new DOMException('timeout'));
      }
      else {
        try {
          const rs = syncFn();
          if(rs!=null) {
            resolve(rs);
          }
        } catch(ex) {
          // error exception
          reject(ex);
        }
      }
    }, interval);
  }).finally(()=>{
    if(_intv) { clearInterval(_intv); }
  })
}

export function addHandlersOf(target:EventTarget, handlers:{[event:string]:EventListener}) {
  return Object.entries(handlers)
    .filter(([_, handler])=>typeof handler === 'function')
    .reduce((t, [eventName, handler])=>{
      const ev = /^on(?<ev>\w)+$/i.exec(eventName)?.groups?.ev ?? eventName;
      t.addEventListener(ev.toLocaleLowerCase(), handler);
      return t;
    }, target);
}