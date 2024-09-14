// -*- compile-command: "npx ts-node applicative.ts" -*-

import { pipe } from "effect/Function";
import * as O from "@effect/typeclass/data/Option";
import * as SA from "@effect/typeclass/SemiApplicative";

// Curried addition functions - don't use dual here it doesn't work with ap!
const add = (x: number) => (y: number): number => x + y;
const add3 = (x: number) => (y: number) => (z: number): number => x + y + z;

// Create a version of ap and of specifically for our Applicative instance
const ap = SA.ap(O.Applicative);
const of = O.Applicative.of;

// Wrapped functions in Option functors
const addWrapped = of(add);
const addWrapped3 = of(add3);


// Using SemiApplicative's `ap` method to apply the curried functions
const result = pipe(
  addWrapped,                                    // Start with the wrapped function
  ap(of(3)),  // Apply to the first Option (x = 3)
  ap(of(5))   // Apply to the second Option (y = 5)
);

console.log(result); // Output: some(8)

const result2 = pipe(
  addWrapped3,                                   // Start with the wrapped function
  ap(of(10)), // Apply to the first Option (x = 10)
  ap(of(6)),  // Apply to the second Option (y = 6)
  ap(of(3))   // Apply to the third Option (z = 3)
);

console.log(result2); // Output: some(19)
