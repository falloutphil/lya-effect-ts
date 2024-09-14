// -*- compile-command: "npx ts-node applicative.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Applicative } from "@effect/typeclass/Applicative";
import type { TypeLambda, Kind } from "effect/HKT";

// Define the addition and concatenation functions
const add = (x: number, y: number): number => x + y;
const concat = (x: string, y: string): string => x + y;

// Helper function to explicitly curry a function of two arguments
function curry2<T, R>(fn: (a: T, b: T) => R): (a: T) => (b: T) => R {
  return (a: T) => (b: T) => fn(a, b);
}

// Function to lift and apply a curried function in the applicative context
function applyFn<F extends TypeLambda, T>(
  A: Applicative<F>,
  fn: (...args: T[]) => T, // Function explicitly typed for two arguments
  ...args: T[]        // Expect exactly two arguments
): Kind<F, unknown, never, never, T> {
  const ap = SA.ap(A);
  const of = A.of;

  // Create an explicitly curried function
  const curriedFn = curry2(fn);

  // Lift the curried function into the applicative context
  const liftedFn = of(curriedFn);
  
  // Lift and apply each argument step by step
  const partiallyApplied1 = ap(of(args[0]))(liftedFn);  // Apply first argument
  const result = ap(of(args[1]))(partiallyApplied1);    // Apply second argument

  return result;
}

// Test cases with Option and Array applicatives
const resultOption = applyFn(O.Applicative, add, 3, 5);
console.log(resultOption); // Expected: some(8)

const resultOption2 = applyFn(O.Applicative, concat, 'Foo', 'Bar');
console.log(resultOption2); // Expected: some("FooBar")

const resultArray = applyFn(A.Applicative, add, 3, 5);
console.log(resultArray); // Expected: [8]
