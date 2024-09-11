// -*- compile-command: "npx ts-node monoid-flatten-array.ts" -*-

import { pipe } from "effect/Function";
import { getMonoid } from "@effect/typeclass/data/Array"; // Importing array-specific Monoid instance

// Flatten an array of arrays using the array Monoid
// This function uses the array Monoid to concatenate nested arrays into a single readonly array
function flattened<A>(array: ReadonlyArray<ReadonlyArray<A>>): ReadonlyArray<A> {
  // Use pipe to pass the array through combineAll with the array monoid
  // The Monoid instance for arrays knows how to concatenate them, with the empty array as the identity
  // The important point here is that getMonoid comes from Array's typeclass NOT A's typeclass
  // So it produces a monoid to combine **Arrays** containing elements of type A, rather than combining
  // elements of type A.
  // It's nice because Typescripts type system is good enough so you can simply pass it the
  // it the array of arrays without having to explicitly says what A is (see below)
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
