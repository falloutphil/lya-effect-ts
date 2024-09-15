// -*- compile-command: "npx ts-node applicative.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Applicative } from "@effect/typeclass/Applicative";
import type { TypeLambda, Kind } from "effect/HKT";

// Define the addition and concatenation functions
const add = (x: number, y: number): number => x + y;
const add3 = (x: number, y: number, z: number): number => x + y + z;
// Test with variadic add_spread function
const add_spread = (...args: number[]): number => args.reduce((acc, val) => acc + val, 0);
// Test with strings
const concat = (x: string, y: string): string => x + y;

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
    case 6:
      return (a: T, b: T, c: T, d: T, e: T, f: T) => fn(a, b, c, d, e, f);
    // Extend further if needed
    default:
      throw new Error(`Unsupported arity (1-6): ${arity}`);
  }
}

// Function to lift and apply a curried function in the applicative context
function applyFn<F extends TypeLambda, T>(
  A: Applicative<F>,
  fn: (...args: T[]) => T, // Variadic function
  ...args: T[]             // Expect a variadic list of arguments
): Kind<F, unknown, never, never, T> {
  const ap = SA.ap(A);
  const of = A.of;

  // Convert the variadic function to a fixed-arity function
  const fixedFn = handleVariadicFunction(fn, args.length);
  // Create a curried version of the fixed-arity function
  const curriedFn = curryN(fixedFn, args.length);

  // Lift the curried function into the applicative context
  let liftedFn = of(curriedFn);

  // Apply each argument step by step
  for (const arg of args) {
    liftedFn = ap(of(arg))(liftedFn);
  }

  return liftedFn as Kind<F, unknown, never, never, T>;
}

// Test cases with Option and Array applicatives
const resultOption = applyFn(O.Applicative, add, 3, 5);
console.log(resultOption); // Expected: some(8)

const resultOption2 = applyFn(O.Applicative, concat, 'Foo', 'Bar');
console.log(resultOption2); // Expected: some("FooBar")

const resultArray = applyFn(A.Applicative, add, 3, 5);
console.log(resultArray); // Expected: [8]

const resultArray3 = applyFn(A.Applicative, add_spread, 1, 2, 3);
console.log(resultArray3); // Expected: [6]

const resultOption3 = applyFn(O.Applicative, add3, 2, 4, 6);
console.log(resultOption3); // Expected some(20)

const resultOption4 = applyFn(O.Applicative, add_spread, 2, 4, 6, 8);
console.log(resultOption4); // Expected some(20)
