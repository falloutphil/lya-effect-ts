// -*- compile-command: "npx ts-node optional-effect.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import { some, none } from "effect/Option";
import type { Covariant } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

// Generic increment function using the generic Covariant interface
function increment<F extends TypeLambda>(
  covariant: Covariant<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
): Kind<F, unknown, unknown, unknown, number> {
  return covariant.map(fa, (x) => x + 1);
}

// Use the Option-specific Covariant instance
const someValue = some(5); // Create an Option containing 5
const incremented = increment(O.Covariant, someValue); // Increment the value inside the Option
console.log(incremented); // Output: Some(6)

// Use the Array-specific Covariant instance
const arrayValue = [1, 2, 3, 4]; // Create an array of numbers
const arrayIncremented = increment(A.Covariant, arrayValue); // Increment each number in the array
console.log(arrayIncremented); // Output: [2, 3, 4, 5]

// Generic lift function that works with any Covariant
function lift<F extends TypeLambda, A, B>(
  covariant: Covariant<F>, 
  fa: Kind<F, unknown, unknown, unknown, A>, 
  f: (a: A) => B
): Kind<F, unknown, unknown, unknown, B> {
  return covariant.map(fa, f); // Apply the mapping function over the container
}

// Example usage of lift with Option
const liftedOption = lift(O.Covariant, someValue, (x: number) => x + 5);
console.log(liftedOption); // Output: Some(10)

// Example usage of lift with Array
const liftedArray = lift(A.Covariant, arrayValue, (x: number) => x * 2);
console.log(liftedArray); // Output: [2, 4, 6, 8]

// Test with None to ensure it works correctly
const liftedNone = lift(O.Covariant, none(), (x: number) => x + 5);
console.log(liftedNone); // Output: None
