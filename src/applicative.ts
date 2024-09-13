// -*- compile-command: "npx ts-node applicative.ts" -*-

import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as O from "@effect/typeclass/data/Option";
import * as SA from "@effect/typeclass/SemiApplicative";

// Curried addition functions
const add = (x: number) => (y: number): number => x + y;
const add3 = (x: number) => (y: number) => (z: number): number => x + y + z;

// Wrapped functions in Option functors
const addWrapped = Option.some(add);
const addWrapped3 = Option.some(add3);

// Using SemiApplicative's `ap` method to apply the curried functions
const result = pipe(
  addWrapped,                                    // Start with the wrapped function
  SA.ap(O.SemiApplicative)(Option.some(3)),  // Apply to the first Option (x = 3)
  SA.ap(O.SemiApplicative)(Option.some(5))   // Apply to the second Option (y = 5)
);

console.log(result); // Output: some(8)

const result2 = pipe(
  addWrapped3,                                   // Start with the wrapped function
  SA.ap(O.SemiApplicative)(Option.some(10)), // Apply to the first Option (x = 10)
  SA.ap(O.SemiApplicative)(Option.some(6)),  // Apply to the second Option (y = 6)
  SA.ap(O.SemiApplicative)(Option.some(3))   // Apply to the third Option (z = 3)
);

console.log(result2); // Output: some(19)
