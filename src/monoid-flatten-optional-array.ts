// -*- compile-command: "npx ts-node monoid-flatten-optional-array.ts" -*-

import { pipe } from "effect/Function"; // Importing the pipe function for functional composition
import * as Option from "effect/Option"; // Importing Option type and utility functions
import { getMonoid as getArrayMonoid } from "@effect/typeclass/data/Array"; // Importing array-specific Monoid instance
import { getOptionalMonoid } from "@effect/typeclass/data/Option"; // Importing the function to create Monoid for Option

// Define a function to flatten an Array of Option<Array<A>>
// This function uses Monoid instances to combine nested Options and Arrays into a single Option containing a flattened array.
function flattenedOption<A>(options: ReadonlyArray<Option.Option<ReadonlyArray<A>>>): Option.Option<ReadonlyArray<A>> {
  // Create a monoid for arrays of type A using the array Monoid instance
  const arrayMonoid = getArrayMonoid<A>();

  // Create a Monoid for Option<Array<A>> using getOptionalMonoid
  // This function lifts the array monoid into the Option context
  const optionMonoid = getOptionalMonoid(arrayMonoid);

  // Use pipe to pass the array of options through combineAll with the option monoid
  // This effectively flattens the nested structure, combining all inner arrays and handling None values appropriately
  return pipe(options, optionMonoid.combineAll);
}

// Usage examples:

// Example 1: Flattening an array of Option<Array<number>>
const optionsArray1: ReadonlyArray<Option.Option<ReadonlyArray<number>>> = [
  Option.some([1, 2]), 
  Option.none(), 
  Option.some([3, 4])
];
const flattenedOptions1 = flattenedOption(optionsArray1);
console.log(flattenedOptions1); // Output: Some([1, 2, 3, 4])

// Example 2: Flattening an array of Option<Array<string>>
const optionsArray2: ReadonlyArray<Option.Option<ReadonlyArray<string>>> = [
  Option.some(["foo", "bar"]), 
  Option.none(), 
  Option.some(["baz"])
];
const flattenedOptions2 = flattenedOption(optionsArray2);
console.log(flattenedOptions2); // Output: Some(["foo", "bar", "baz"])

// Example 3: Flattening an array where all elements are None
const optionsArray3: ReadonlyArray<Option.Option<ReadonlyArray<number>>> = [
  Option.none(), 
  Option.none(), 
  Option.none()
];
const flattenedOptions3 = flattenedOption(optionsArray3);
console.log(flattenedOptions3); // Output: None
