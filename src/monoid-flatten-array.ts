// -*- compile-command: "npx tsx monoid-flatten-array.ts" -*-

import { pipe } from "effect/Function";
import * as Array from "effect/Array";

// Reducer is v4's monoid-shaped interface: combine + initialValue + combineAll.
// This combines whole arrays by concatenation, not the numbers/strings inside.
function flattened<A>(array: ReadonlyArray<ReadonlyArray<A>>): ReadonlyArray<A> {
  // The native reducer accepts mutable inner arrays. Copy readonly inputs at
  // the boundary; the caller's arrays stay unchanged.
  return pipe(array, Array.map(Array.fromIterable), Array.makeReducerConcat<A>().combineAll);
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
