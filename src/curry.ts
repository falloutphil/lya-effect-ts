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

// Function to convert a variadic function into a fixed-arity function using explicit lambdas
function handleVariadicFunction<T>(
  fn: (...args: T[]) => T,
  arity: number
) {
  // Return a function with a fixed number of parameters based on arity
  switch (arity) {
    case 1:
      return (a: T) => fn(a);
    case 2:
      return (a: T, b: T) => fn(a, b);
    case 3:
      return (a: T, b: T, c: T) => fn(a, b, c);
    case 4:
      return (a: T, b: T, c: T, d: T) => fn(a, b, c, d);
    // Extend further if needed
    default:
      throw new Error(`Unsupported arity (1-4): ${arity}`);
  }
}

// Example of a variadic function using reduce
const add_spread = (...args: number[]): number => args.reduce((acc, val) => acc + val, 0);

// Create fixed-arity functions from the variadic function
const add2 = handleVariadicFunction(add_spread, 2);
const add3 = handleVariadicFunction(add_spread, 3);
const add4 = handleVariadicFunction(add_spread, 4);

// Currying the fixed-arity functions
const curriedAdd2 = curryN(add2, 2);
const curriedAdd3 = curryN(add3, 3);
const curriedAdd4 = curryN(add4, 4);

// Applying arguments one by one to the curried functions

// Testing curriedAdd2
const add2Step1 = curriedAdd2(3); // Returns a function (number) => number
const add2Result = add2Step1(5);  // Returns 8
console.log(`add2Result: ${add2Result}`); // Expected output: 8

// Testing curriedAdd3
const add3Step1 = curriedAdd3(1); // Returns a function (number) => (number) => number
const add3Step2 = add3Step1(2);   // Returns a function (number) => number
const add3Result = add3Step2(3);  // Returns 6
console.log(`add3Result: ${add3Result}`); // Expected output: 6

// Testing curriedAdd4
const add4Step1 = curriedAdd4(1); // Returns a function (number) => (number) => (number) => number
const add4Step2 = add4Step1(2);   // Returns a function (number) => (number) => number
const add4Step3 = add4Step2(3);   // Returns a function (number) => number
const add4Result = add4Step3(4);  // Returns 10
console.log(`add4Result: ${add4Result}`); // Expected output: 10
