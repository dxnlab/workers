function initiator(constructor:any, value?:any) {
  constructor._tests = constructor._tests || value || 1;
  console.log('initiator with', constructor.toString());
}

export function clsDeco(tests=globalThis._tests) {
  console.log('cls deco start');
  return function(cls, context) {
    console.log('cls deco run');
    context.addInitializer(function(this){
      console.log('class initializer on', this);
    });
    return cls;
  }
}

export function methodDeco(method, context) {
  console.log('method deco start', JSON.stringify(method.constructor.__proto__));
  context.addInitializer(function(this) {
    console.log('method initializer on', this);
  })
  return method;
}

