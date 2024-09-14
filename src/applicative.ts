// -*- compile-command: "npx ts-node applicative.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Applicative } from "@effect/typeclass/Applicative";
import type { TypeLambda, Kind } from "effect/HKT";

// Define the addition function taking two parameters
const add = (x: number, y: number): number => x + y;
const concat = (x: string, y: string): string => x + y;

// Function to lift the `add` function into the applicative context and apply it
function applyFn<F extends TypeLambda, T>(
  A: Applicative<F>,
  fn: (...args: T[]) => T, // Specific function type: add
  ...args: T[]
): Kind<F, unknown, never, never, T> {
  const ap = SA.ap(A);
  const of = A.of;

  // Lift the function into the Applicative context as a curried function
  const liftedFn = of((x: T) => (y: T) => fn(x, y));

  // Lift the first argument
  const liftedX = of(args[0]);

  // Apply the first argument to the lifted function
  const partiallyApplied = ap(liftedX)(liftedFn);

  // Lift the second argument
  const liftedY = of(args[1]);

  // Apply the second argument
  const result = ap(liftedY)(partiallyApplied);

  return result;
}

// Test cases with Option and Array applicatives
const resultOption = applyFn(O.Applicative, add, 3, 5);
console.log(resultOption); // Expected: some(8)

const resultOption2 = applyFn(O.Applicative, concat, 'Foo', 'Bar');
console.log(resultOption2);


const resultArray = applyFn(A.Applicative, add, 3, 5);
console.log(resultArray); // Expected: [8]
