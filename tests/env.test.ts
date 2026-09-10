import { describe, test, expect } from "vitest";
import { decoratorPresents } from "./env.preset";

describe('environment setup', ()=>{
  test('decorator', ()=>{
    decoratorPresents();
  });
});