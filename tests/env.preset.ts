import { expect } from 'vitest'

function classDecorator(target:any, context:DecoratorContext) {
  expect(context.kind).toBe('class');
  Object.defineProperties(target, {
    staticProperty: { get: ()=>true }
  });
  return target;
}

@classDecorator
class Foo {}

export function decoratorPresents() {
  expect(Foo?.staticProperty).toBe(true);
}