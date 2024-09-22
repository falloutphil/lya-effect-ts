// -*- compile-command: "npx ts-node pierre-monad.ts" -*-

// Importing necessary functions and types from effect-ts
import { pipe } from '@effect/data/Function';
import * as O from '@effect/data/Option'; // Option is the equivalent of Maybe in effect-ts

// Type aliases for birds and pole
type Birds = number;
type Pole = [Birds, Birds]; // A tuple representing birds on the left and right

/**
 * landLeft function
 * Effect-TS equivalent: Adds birds to the left side and checks balance; returns None if unbalanced
 */
const landLeft = (n: Birds) => (pole: Pole): O.Option<Pole> =>
  Math.abs((pole[0] + n) - pole[1]) < 4 ? O.some([pole[0] + n, pole[1]] as Pole) : O.none();

/**
 * landRight function
 * Effect-TS equivalent: Adds birds to the right side and checks balance; returns None if unbalanced
 */
const landRight = (n: Birds) => (pole: Pole): O.Option<Pole> =>
  Math.abs(pole[0] - (pole[1] + n)) < 4 ? O.some([pole[0], pole[1] + n] as Pole) : O.none();

/**
 * Simulating a sequence of bird landings using flatMap
 * Mirrors Haskell's use of >>= to chain operations that might fail
 */
const landingSequence = pipe(
  O.some([0, 0] as Pole),            // Start with an initial balanced pole in the Option context, cast as a Pole tuple
  O.flatMap(landLeft(1)),     // First, land 1 bird on the left
  O.flatMap(landRight(4)),    // Then, land 4 birds on the right - boom! Change to 3 for success!
  O.flatMap(landLeft(-1)),    // Next, one bird flies away from the left
  O.flatMap(landRight(-2))    // Finally, two birds fly away from the right
);

console.log('Landing sequence result:', landingSequence); // Should output: None if unbalanced

/**
 * banana function
 * Effect-TS equivalent: Causes Pierre to fall by always returning None, representing failure
 */
const banana = (_: Pole): O.Option<Pole> => O.none();

/**
 * Simulating a failed sequence with banana
 * Shows how adding a guaranteed failure (banana) affects the chain
 */
const failedLanding = pipe(
  O.some([0, 0] as Pole),           // Start with a balanced pole, cast as a Pole tuple
  O.flatMap(landLeft(1)),   // Land 1 bird on the left
  O.flatMap(banana),        // Banana function, guarantees failure
  O.flatMap(landRight(1))   // This step will never be reached
);

console.log('Failed sequence with banana:', failedLanding); // Should output: None
