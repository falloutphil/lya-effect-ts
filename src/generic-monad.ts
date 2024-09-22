// -*- compile-command: "npx ts-node generic-monad.ts" -*-

import { pipe } from "@effect/data/Function";
import * as O from "@effect/typeclass/data/Option"; // Option Monad
import * as E from "@effect/typeclass/data/Either"; // Either Monad
import * as A from "@effect/typeclass/data/Array";  // Array Monad
import { Monad } from "@effect/typeclass/Monad";    // Monad interface
import type { TypeLambda, Kind } from "effect/HKT";

// Type alias for data points (in this case, numbers)
type DataPoint = number;

// First monadic operation: Add a number
const add = <F extends TypeLambda>
  (M: Monad<F>) =>
  (n: number) =>
  (value: DataPoint): Kind<F, unknown, never, never, DataPoint> =>
  // This isn't a very interesting use of the monad
  // Because it must work for all monads we can only use functions
  // on the Monad typeclass.
  // So here we just add the provided value to the unwrapped value
  // and wrap it back up in a monad - there is no change to the Monadic
  // context (for example Some->None), because that would specific to
  // the instance of the Monad typeclass.
  // This is arguably pointless and the Pierre example with Options
  // is a much better use of a specific instance of the Monad typeclass
  // but this does show that we can handle Monads generically!
  M.of(value + n);

// Second monadic operation: Multiply by a number
const multiply = <F extends TypeLambda>
  (M: Monad<F>) =>
  (n: number) =>
  (value: DataPoint): Kind<F, unknown, never, never, DataPoint> =>
  M.of(value * n);

// Third monadic operation: Subtract a number
const subtract = <F extends TypeLambda>
  (M: Monad<F>) =>
  (n: number) =>
  (value: DataPoint): Kind<F, unknown, never, never, DataPoint> =>
  M.of(value - n);

// Generic chain of monadic operations
const monadicChain = <F extends TypeLambda>
  (M: Monad<F>) =>
  pipe(
    M.of(10 as DataPoint),         // Initial value wrapped in a monad: 10
    // Pipe passes the lifted 10 as the 2nd arge of the below flatmap 
    // Flatmap unwraps the 10, and applies it to add(M)(5)(10) ---- 10 + 5 = 15 
    M.flatMap(add(M)(5)),
    M.flatMap(multiply(M)(3)),     // Multiply by 3: 15 * 3 = 45
    M.flatMap(subtract(M)(10))     // Subtract 10: 45 - 10 = 35
  );

// Option Monad: Chain of transformations using Option
console.log("----- Option Monad -----");
const resultOption = monadicChain(O.Monad);
console.log(resultOption); // Expected: Some(35)

// Either Monad: Chain of transformations using Either
console.log("----- Either Monad -----");
const resultEither = monadicChain(E.Monad);
console.log(resultEither); // Expected: Right(35)

// Array Monad: Chain of transformations using Array
console.log("----- Array Monad -----");
const resultArray = monadicChain(A.Monad);
console.log(resultArray); // Expected: Array of all possible outcomes
