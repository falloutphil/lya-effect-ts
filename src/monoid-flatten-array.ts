// -*- compile-command: "npx ts-node monoid-flatten-array.ts" -*-

import { pipe } from "effect/Function"; // Importing the pipe function for function composition
import { getMonoid } from "@effect/typeclass/data/Array"; // Importing array-specific Monoid instance

// Flatten an array of arrays using the array Monoid
// This function uses the array Monoid to concatenate nested arrays into a single readonly array
function flattened<A>(array: ReadonlyArray<ReadonlyArray<A>>): ReadonlyArray<A> {
  // Use pipe to pass the array through combineAll with the array monoid
  // The Monoid instance for arrays knows how to concatenate them, with the empty array as the identity
  return pipe(array, getMonoid<A>().combineAll);
}

// Usage examples:

// Flattening an array of arrays of numbers
const numbersArray: ReadonlyArray<ReadonlyArray<number>> = [[1, 2], [4, 5]];
const flattenedNumbers = flattened(numbersArray);
console.log(flattenedNumbers); // Output: [1, 2, 4, 5]

// Flattening an array of arrays of strings
const stringsArray: ReadonlyArray<ReadonlyArray<string>> = [["foo", "bar"], ["baz"]];
const flattenedStrings = flattened(stringsArray);
console.log(flattenedStrings); // Output: ["foo", "bar", "baz"]
