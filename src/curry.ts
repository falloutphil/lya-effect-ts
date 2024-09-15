// -*- compile-command: "npx ts-node curry.ts" -*-

// A type for curried functions to make the return type explicit
type CurriedFunction<T extends any[], R> = 
  T extends [infer First, ...infer Rest]
    ? (arg: First) => CurriedFunction<Rest, R>
    : R;

// The `curryN` function: It takes a function and the arity of that function as parameters
function curryN<T extends any[], R>(fn: (...args: T) => R, arity: number = fn.length): CurriedFunction<T, R> {
  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...args as T);
    } else {
      return (...moreArgs: any[]) => curried(...[...args, ...moreArgs]);
    }
  } as CurriedFunction<T, R>;
}

const add2_spread = (...args: number[]): number => args[0] + args[1]

// Example 1: Function that adds two numbers
const add2 = (x: number, y: number): number => x + y;
const curriedAdd2 = curryN(add2, 2);

// Testing curriedAdd2
const add2Step1 = curriedAdd2(3); // Should return a function (number) => number
const add2Result = add2Step1(5);  // Should return 8
console.log(add2Result); // Expected output: 8

// Example 2: Function that adds three numbers
const add3 = (x: number, y: number, z: number): number => x + y + z;
const curriedAdd3 = curryN(add3, 3);

// Testing curriedAdd3
const add3Step1 = curriedAdd3(1);      // Should return a function (number) => (number) => number
const add3Step2 = add3Step1(2);        // Should return a function (number) => number
const add3Result = add3Step2(3);       // Should return 6
console.log(add3Result); // Expected output: 6
