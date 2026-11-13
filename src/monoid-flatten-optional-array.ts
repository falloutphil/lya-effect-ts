// -*- compile-command: "npx tsx monoid-flatten-optional-array.ts" -*-

import { pipe } from "effect/Function";
import * as Array from "effect/Array";
import * as Option from "effect/Option";

// Lift array concatenation into an optional context, with None as identity.
function flattenedOption<A>(options: ReadonlyArray<Option.Option<ReadonlyArray<A>>>): Option.Option<ReadonlyArray<A>> {
  const arrayReducer = Array.makeReducerConcat<A>();
  // Some + None keeps the Some; two Somes concatenate; all None stays None.
  // This differs from makeReducerFailFast, where any None loses the result.
  const optionReducer = Option.makeReducer(arrayReducer);
  return pipe(
    options,
    Array.map(Option.map(Array.fromIterable)),
    optionReducer.combineAll
  );
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
