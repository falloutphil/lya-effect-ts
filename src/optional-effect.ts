// -*- compile-command: "npx ts-node optional-effect.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import { some, none } from "effect/Option";
import type { Covariant } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

import { getSemigroup } from "@effect/typeclass/SemiApplicative";
import { SemigroupSum } from "@effect/typeclass/data/Number";
import { lift2 } from "@effect/typeclass/SemiApplicative";

// Generic increment function using the generic Covariant interface
// This function works with any Covariant functor, such as Option or Array.
// It applies a simple increment operation to each element inside the functor.
function increment<F extends TypeLambda>(
  covariant: Covariant<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
): Kind<F, unknown, unknown, unknown, number> {
  return covariant.map(fa, (x) => x + 1);
}

// Use the Option-specific Covariant instance
// We create an Option containing the value 5 and increment the value inside.
// The Option remains Some as long as it starts as Some.
const someValue = some(5); // Create an Option containing 5
const incremented = increment(O.Covariant, someValue); // Increment the value inside the Option
console.log(incremented); // Output: Some(6)

// Use the Array-specific Covariant instance
// We create an array of numbers and increment each number in the array.
// Arrays in effect-ts are also Covariant, allowing the use of the same increment function.
const arrayValue = [1, 2, 3, 4]; // Create an array of numbers
const arrayIncremented = increment(A.Covariant, arrayValue); // Increment each number in the array
console.log(arrayIncremented); // Output: [2, 3, 4, 5]

// Generic lift function that works with any Covariant
// This function lifts a transformation function (f) into the Covariant context.
// It applies the transformation to each element within the functor.
function lift<F extends TypeLambda, A, B>(
  covariant: Covariant<F>, 
  fa: Kind<F, unknown, unknown, unknown, A>, 
  f: (a: A) => B
): Kind<F, unknown, unknown, unknown, B> {
  return covariant.map(fa, f); // Apply the mapping function over the container
}

// Example usage of lift with Option
// We use the lift function to add 5 to the number inside the Option.
const liftedOption = lift(O.Covariant, someValue, (x: number) => x + 5);
console.log(liftedOption); // Output: Some(10)

// Example usage of lift with Array
// The lift function is used here to double each element in the array.
const liftedArray = lift(A.Covariant, arrayValue, (x: number) => x * 2);
console.log(liftedArray); // Output: [2, 4, 6, 8]

// Test with None to ensure it works correctly
// Applying a transformation to None remains None because there is no value to map over.
const liftedNone = lift(O.Covariant, none(), (x: number) => x + 5);
console.log(liftedNone); // Output: None

// Lift the Semigroup into the Option context using SemiApplicative's getSemigroup
// This creates a semigroup for Option<number> by lifting the SemigroupSum into the Option context.
// When combining Options using this semigroup, it adds the values inside if both are Some.
// If either Option is None, the result is None, which matches the behavior of short-circuiting.
const optionSemigroup = getSemigroup(O.SemiApplicative)(SemigroupSum);

// Combine Option values using the lifted Semigroup
// Both Options must be Some for the combine operation to succeed.
const combined = optionSemigroup.combine(some(2), some(3)); // Some(5)
const combinedWithNone = optionSemigroup.combine(some(2), none<number>()); // None

console.log(combined); // Output: Some(5)
console.log(combinedWithNone); // Output: None

// Use lift2 to lift the SemigroupSum's combine operation into the Option context
// lift2 allows us to lift a binary function, like SemigroupSum.combine, to operate within the context of Options.
// This is analogous to combining two Options using a lifted version of the Semigroup's combine operation.
const combineWithLift2 = lift2(O.SemiApplicative)((x: number, y: number) => SemigroupSum.combine(x, y));

// Apply the lifted function to Option values
// As with the semigroup example, both Options must be Some for a successful combination.
const result = combineWithLift2(some(2), some(3));  // Some(5)

console.log(result); // Output: Some(5)
