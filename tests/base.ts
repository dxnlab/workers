import { expect, vi } from "vitest";

export function emit(target:EventTarget, type:string, data:object={}) {
  const event = Object.assign(new CustomEvent(type), data);
  target.dispatchEvent(event);
  return event;
}

export function buildMocks(...events:string[]) {
  return Object.fromEntries(events.map((e)=>[e, vi.fn()]));
}

export function testEventHandlers(target:EventTarget, expectations:{[e:string]:Function}) {
  Object.entries(expectations).forEach(([event, mockFn])=>{
    const ev = emit(target, event);
    expect(mockFn).toHaveBeenCalledWith(ev);
  }); 
}