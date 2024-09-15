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
    case 5:
      return (a: T, b: T, c: T, d: T, e: T) => fn(a, b, c, d, e);
    // Extend further if needed
    default:
      throw new Error(`Unsupported arity (1-5): ${arity}`);
  }
}

// Example of a variadic function
const add2_spread = (...args: number[]): number => args[0] + args[1];

// Convert the variadic function to a fixed-arity function using the lambda
const add2 = handleVariadicFunction(add2_spread, 2);

// Currying the fixed-arity function
const curriedAdd2 = curryN(add2, 2);

// Applying arguments one by one to the curried function
const add2Step1 = curriedAdd2(3); // Should return a function (number) => number
const add2Result = add2Step1(5);  // Should return 8
console.log(`add2Result: ${add2Result}`); // Expected output: 8

// You can follow the same process for add3 or any other arity
