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
  O.some([0, 0] as Pole), // Start with an initial balanced pole in the Option context
  O.flatMap(landLeft(1)), // First, land 1 bird on the left
  O.flatMap(landRight(4)), // Then, land 4 birds on the right. Change 4 to 3 for success
  O.flatMap(landLeft(-1)), // Next, one bird flies away from the left
  O.flatMap(landRight(-2)) // Finally, two birds fly away from the right
);

// NOTE: the above is the pipe friendly (data-last) form of O.flatMap(f):
// eg  O.flatMap(landLeft(1))
// It returns a function waiting for the previous Option<Pole>
// from pipe.
// Remember: pipe(value, f1, f2, f3) is just f3(f2(f1(value))) so the first param of O.flatMap
// in this form is the function to apply to the previous value, not the previous value itself.
// So `O.flatMap(landLeft(1))` has already been turned into a function
// of type Option<Pole> -> Option<Pole>. The previous Option<Pole>
// is supplied by pipe.

// There is also the non-pipe (data-first) form where the function is the second param:
// O.flatMap(
//   O.some([0, 0] as Pole),
//   landLeft(1)
// )
//
// Haskell equivalent: return (0,0) >>= landLeft 1 which is just (>>=) (return (0,0)) (landLeft 1)




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
  O.bind("pole0", () => O.some([0, 0] as Pole)), // Start by binding the initial balanced pole
  O.bind("pole1", ({ pole0 }) => landLeft(1)(pole0)), // From pole0, land 1 bird on the left
  O.bind("pole2", ({ pole1 }) => landRight(4)(pole1)), // From pole1, land 4 birds on the right. Change 4 to 3 for success
  O.bind("pole3", ({ pole2 }) => landLeft(-1)(pole2)), // From pole2, one bird flies away from the left
  O.bind("pole4", ({ pole3 }) => landRight(-2)(pole3)), // From pole3, two birds fly away from the right
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
  const pole0 = yield* O.some([0, 0] as Pole); // Start with an initial balanced pole
  const pole1 = yield* landLeft(1)(pole0); // First, land 1 bird on the left
  const pole2 = yield* landRight(4)(pole1); // Then, land 4 birds on the right. Change 4 to 3 for success
  const pole3 = yield* landLeft(-1)(pole2); // Next, one bird flies away from the left
  const pole4 = yield* landRight(-2)(pole3); // Finally, two birds fly away from the right

  return pole4;
});

/**
 * Same three styles, but with banana.
 *
 * banana returns None, so the final landRight(1) is never reached.
 */
const failedLandingFlatMap = pipe(
  O.some([0, 0] as Pole), // Start with a balanced pole
  O.flatMap(landLeft(1)), // Land 1 bird on the left
  O.flatMap(banana), // Slip on the banana: this guarantees failure
  O.flatMap(landRight(1)) // This step is never reached
);

const failedLandingDo = pipe(
  O.Do,
  O.bind("pole0", () => O.some([0, 0] as Pole)), // Start with a balanced pole
  O.bind("pole1", ({ pole0 }) => landLeft(1)(pole0)), // Land 1 bird on the left
  O.bind("pole2", ({ pole1 }) => banana(pole1)), // Slip on the banana: this returns None
  O.bind("pole3", ({ pole2 }) => landRight(1)(pole2)), // This bind is never reached
  O.map(({ pole3 }) => pole3)
);

const failedLandingGen = O.gen(function* () {
  const pole0 = yield* O.some([0, 0] as Pole); // Start with a balanced pole
  const pole1 = yield* landLeft(1)(pole0); // Land 1 bird on the left

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
