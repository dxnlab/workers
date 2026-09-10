import { clsDeco, methodDeco } from "./deco";

globalThis._tests = true;

@clsDeco()
class Foo {
  @methodDeco
  public bar() {
    console.log('foo bar', Foo._tests);
  }
}

console.log('init instance');
const foo = new Foo;
console.log(foo);
foo.bar();
