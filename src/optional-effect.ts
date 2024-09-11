// -*- compile-command: "npx ts-node optional-effect.ts" -*-

// You can see my original fp-ts code here this is based on:
// https://github.com/falloutphil/fp-ts-doodling/blob/main/Optional-use-fp.ts

import * as Option from "effect/Option";
import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array"
import * as N  from "@effect/typeclass/data/Number";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Covariant } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

// Generic increment function using the generic Covariant interface
// This function applies an increment operation to each element inside a Covariant functor,
// like Option or Array, making it a reusable utility across different contexts.
function increment<F extends TypeLambda>(
  covariant: Covariant<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
): Kind<F, unknown, unknown, unknown, number> {
  return covariant.map(fa, (x) => x + 1);
}

// Use the Option-specific Covariant instance
// We create an Option containing the value 5 and increment the value inside.
// The Option remains Some as long as it starts as Some.
const someValue = Option.some(5); // Create an Option containing 5
const incremented = increment(O.Covariant, someValue); // Increment the value inside the Option
console.log(incremented); // Output: Some(6)

// Use the Array-specific Covariant instance
const arrayValue = [1, 2, 3, 4]; // Create an array of numbers
const arrayIncremented = increment(A.Covariant, arrayValue); // Increment each number in the array
console.log(arrayIncremented); // Output: [2, 3, 4, 5]

// Generic lift function that works with any Covariant
// This function lifts a transformation function into the Covariant context,
// allowing it to be applied to each element inside the functor.
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
const liftedNone = lift(O.Covariant, Option.none(), (x: number) => x + 5);
console.log(liftedNone); // Output: None

// Lift the Semigroup into the Option context using SemiApplicative's getSemigroup
// getSemigroup combines Option values using a Semigroup operation,
// which is a common alternative to using map in certain contexts.

// getSemigroup leverages O.SemiApplicative to create a semigroup for Option<number>
// by lifting the semigroup operation of Number (SemigroupSum) into the Option context.
// Essentially, it combines the capabilities of O.SemiApplicative and SemigroupSum to define how
// Some values are combined (+ via SemigroupSum) and how None values are managed
// (i.e., None short-circuits the operation).
const optionSemigroup = SA.getSemigroup(O.SemiApplicative)(N.SemigroupSum);

// Combine Option values using the lifted Semigroup
// This semigroup allows us to combine two Option values where both need to be Some for a result
const combined = optionSemigroup.combine(Option.some(2), Option.some(3)); // Some(5)
// If either is None, the result is None
const combinedWithNone = optionSemigroup.combine(Option.some(2), Option.none()); // None

console.log(combined); // Output: Some(5)
console.log(combinedWithNone); // Output: None

// Use lift2 to lift the SemigroupSum's combine operation into the Option context
// lift2 allows us to lift a binary function, like SemigroupSum.combine, to operate within the context of Options.
// This is analogous to combining two Options using a lifted version of the Semigroup's combine operation.
// Obviously, this doesn't create a new semigroup; it's just lifting the combine function as if
// it was any other function.
const combineWithLift2 = SA.lift2(O.SemiApplicative)(N.SemigroupSum.combine);

// Apply the lifted function to Option values
// As with the semigroup example, both Options must be Option.Some for a successful combination.
const result = combineWithLift2(Option.some(2), Option.some(3));  // Some(5)

console.log(result); // Output: Some(5)
