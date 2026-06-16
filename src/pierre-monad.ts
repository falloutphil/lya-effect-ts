// -*- compile-command: "npx tsx pierre-monad.ts" -*-

import { pipe } from "effect/Function";
import * as O from "effect/Option";

// Option is Effect's equivalent of Haskell's Maybe.
//
// Haskell:
//   Maybe Pole
//
// Effect TS:
//   Option<Pole>
//
// Some(pole) = success / Just pole
// None       = failure / Nothing

type Birds = number;
type Pole = [Birds, Birds];

// landLeft 1 has the important monadic-function shape:
//
//   Pole -> Option<Pole>
//
// Haskell equivalent:
//
//   landLeft 1 :: Pole -> Maybe Pole
//
// This is why we need flatMap/bind, not map.
const landLeft = (n: Birds) => (pole: Pole): O.Option<Pole> =>
  Math.abs((pole[0] + n) - pole[1]) < 4
    ? O.some([pole[0] + n, pole[1]] as Pole)
    : O.none();

const landRight = (n: Birds) => (pole: Pole): O.Option<Pole> =>
  Math.abs(pole[0] - (pole[1] + n)) < 4
    ? O.some([pole[0], pole[1] + n] as Pole)
    : O.none();

// banana always fails.
//
// Haskell:
//
//   banana :: Pole -> Maybe Pole
//   banana _ = Nothing
const banana = (_: Pole): O.Option<Pole> => O.none();

/**
 * 1. pipe + flatMap
 *
 * This is closest to Haskell's >>= chain:
 *
 *   return (0,0)
 *     >>= landLeft 1
 *     >>= landRight 4
 *     >>= landLeft (-1)
 *     >>= landRight (-2)
 *
 * Each O.flatMap step:
 *
 *   Option<Pole> + (Pole -> Option<Pole>) -> Option<Pole>
 *
 * If the previous value is None, the rest is skipped.
 */
const landingSequenceFlatMap = pipe(
  O.some([0, 0] as Pole),
  O.flatMap(landLeft(1)),
  O.flatMap(landRight(4)), // Change 4 to 3 for success
  O.flatMap(landLeft(-1)),
  O.flatMap(landRight(-2))
);

// NOTE: this is the pipe friendly form of O.flatMap(f) 
// There is also the non-pipe form where the function is the second param:
// O.flatMap(
//   O.some([0, 0] as Pole),
//   landLeft(1)
// )
//
// This is just return (0,0) >>= landLeft 1 

/**
 * 2. O.Do notation
 *
 * This is Effect's record-building do notation.
 *
 * Each O.bind:
 *
 * - receives all previously bound successful values
 * - returns the next Option
 * - stops immediately if any step returns None
 *
 * The final O.map extracts the final value we actually care about.
 */
const landingSequenceDo = pipe(
  O.Do,
  O.bind("pole0", () => O.some([0, 0] as Pole)),
  O.bind("pole1", ({ pole0 }) => landLeft(1)(pole0)),
  O.bind("pole2", ({ pole1 }) => landRight(4)(pole1)), // Change 4 to 3 for success
  O.bind("pole3", ({ pole2 }) => landLeft(-1)(pole2)),
  O.bind("pole4", ({ pole3 }) => landRight(-2)(pole3)),
  O.map(({ pole4 }) => pole4)
);

/**
 * 3. O.gen generator notation
 *
 * This is closest to Haskell's do notation:
 *
 *   do
 *     pole0 <- return (0,0)
 *     pole1 <- landLeft 1 pole0
 *     pole2 <- landRight 4 pole1
 *     pole3 <- landLeft (-1) pole2
 *     landRight (-2) pole3
 *
 * Every `yield*` is secretly a flatMap.
 *
 * If any yielded Option is None, the generator stops and the whole result is None.
 */
const landingSequenceGen = O.gen(function* () {
  const pole0 = yield* O.some([0, 0] as Pole);
  const pole1 = yield* landLeft(1)(pole0);
  const pole2 = yield* landRight(4)(pole1); // Change 4 to 3 for success
  const pole3 = yield* landLeft(-1)(pole2);
  const pole4 = yield* landRight(-2)(pole3);

  return pole4;
});

/**
 * Same three styles, but with banana.
 *
 * banana returns None, so the final landRight(1) is never reached.
 */
const failedLandingFlatMap = pipe(
  O.some([0, 0] as Pole),
  O.flatMap(landLeft(1)),
  O.flatMap(banana),
  O.flatMap(landRight(1))
);

const failedLandingDo = pipe(
  O.Do,
  O.bind("pole0", () => O.some([0, 0] as Pole)),
  O.bind("pole1", ({ pole0 }) => landLeft(1)(pole0)),
  O.bind("pole2", ({ pole1 }) => banana(pole1)),
  O.bind("pole3", ({ pole2 }) => landRight(1)(pole2)),
  O.map(({ pole3 }) => pole3)
);

const failedLandingGen = O.gen(function* () {
  const pole0 = yield* O.some([0, 0] as Pole);
  const pole1 = yield* landLeft(1)(pole0);

  // This yields None, so execution stops here.
  const pole2 = yield* banana(pole1);

  // This line is never reached.
  const pole3 = yield* landRight(1)(pole2);

  return pole3;
});

console.log("landingSequenceFlatMap:", landingSequenceFlatMap);
console.log("landingSequenceDo:     ", landingSequenceDo);
console.log("landingSequenceGen:    ", landingSequenceGen);

console.log("failedLandingFlatMap:  ", failedLandingFlatMap);
console.log("failedLandingDo:       ", failedLandingDo);
console.log("failedLandingGen:      ", failedLandingGen);
