// -*- compile-command: "npx ts-node applicative.ts" -*-

import { pipe } from "effect/Function";
import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Applicative } from "@effect/typeclass/Applicative";

// Curried addition functions
const add = (x: number) => (y: number): number => x + y;
const add3 = (x: number) => (y: number) => (z: number): number => x + y + z;

// Define recursive type for curried functions taking numbers
type CurriedFunction<A extends number[], R> = A extends [infer First, ...infer Rest]
  ? First extends number
    ? Rest extends number[]
      ? (arg: First) => CurriedFunction<Rest, R>
      : R
    : never
  : R;

// Function to apply curried functions using a provided Applicative Functor
function applyCurriedFunction<F extends Applicative<any>, A extends number[]>(
  A: F,
  fn: CurriedFunction<A, number>, // Restricted to curried functions with numeric parameters
  ...args: A                      // Variadic numeric arguments
) {
  const ap = SA.ap(A);
  const of = A.of;
  // of(fn) is evaluated once as the initial accumulator (lifting the provided function)
  // The accumulator (liftedFn) is passed through each call of ap(of(arg))(liftedFn),
  // applying ap to the previous result and the next argument for the curried function.
  return args.reduce((liftedFn, arg) => ap(of(arg))(liftedFn),
                     of(fn));

}

// Test with curried functions add and add3
const result = applyCurriedFunction(O.Applicative, add, 3, 5);
console.log(result); // Output: some(8)

const result2 = applyCurriedFunction(O.Applicative, add3, 10, 6, 3);
console.log(result2); // Output: some(19)

// Test with curried functions add and add3
const result3 = applyCurriedFunction(A.Applicative, add, 3, 5);
console.log(result3); // Output: some(8)

const result4 = applyCurriedFunction(A.Applicative, add3, 10, 6, 3);
console.log(result4); // Output: some(19)
