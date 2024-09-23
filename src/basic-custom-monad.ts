// -*- compile-command: "npx ts-node basic-custom-monad.ts" -*-

import { pipe, dual } from "effect/Function";
import type { Covariant as CovariantType } from "@effect/typeclass/Covariant";
import { Monad as MonadType } from "@effect/typeclass/Monad";
import { flatten, zipRight, composeK } from "@effect/typeclass/FlatMap";
import type { Kind, TypeLambda } from "effect/HKT";

// Define the custom and trivial HKT X
type X<A> = {
  x: A;
};

// Define TypeLambda for X
interface XTypeLambda extends TypeLambda {
  readonly type: X<this["Target"]>;
}

// Covariant (Functor) instance for XTypeLambda
const CovariantX: CovariantType<XTypeLambda> = {
  map: dual(
    2,
    <R, O, E, A, B>(
      fa: Kind<XTypeLambda, R, O, E, A>,
      f: (a: A) => B
    ): Kind<XTypeLambda, R, O, E, B> => {
      return { x: f(fa.x) };
    }
  ),

  // Implementing 'imap' for bidirectional mapping (A -> B and B -> A)
  imap: dual(
    3,
    <R, O, E, A, B>(
      fa: Kind<XTypeLambda, R, O, E, A>,
      to: (a: A) => B,
      from: (b: B) => A
    ): Kind<XTypeLambda, R, O, E, B> => {
      return { x: to(fa.x) };
    }
  )
};

// Monad instance for XTypeLambda
const MonadX: MonadType<XTypeLambda> = {
  // 'of' creates an X container around a value
  of: <A>(value: A): Kind<XTypeLambda, unknown, never, never, A> => ({ x: value }),

  // 'flatMap' applies a function f to the value inside X and returns a new X
  flatMap: dual(
    2,
    <R1, O1, E1, A, R2, O2, E2, B>(
      fa: Kind<XTypeLambda, R1, O1, E1, A>,
      f: (a: A) => Kind<XTypeLambda, R2, O2, E2, B>
    ): Kind<XTypeLambda, R1 & R2, O1 | O2, E1 | E2, B> => {
      return f(fa.x);
    }
  ),

  // 'map' reuses the implementation from Covariant
  map: CovariantX.map,
  imap: CovariantX.imap
};

// Example of chaining results
const result = pipe(
  MonadX.of(2),
  MonadX.flatMap((n: number) => MonadX.of(n * 2)),
  MonadX.flatMap((n: number) => MonadX.of(`${n}!`))
);

console.log(result); // Output: { x: "4!" }


// Additional examples using functions from FlatMap

// Example 1: Using `flatten`
const nested = MonadX.of(MonadX.of(42)); // { x: { x: 42 } }
const flattened = flatten(MonadX)(nested);
console.log(flattened); // Output: { x: 42 }

// Example 2: Using `zipRight`, discarding the first result of 2
const resultZipRight = zipRight(MonadX)(MonadX.of(2), MonadX.of("Second!"));
console.log(resultZipRight); // Output: { x: "Second!" }

// Example 3: Using `composeK`
const composed = composeK(MonadX)(
  (n: number) => MonadX.of(n + 1),
  (n: number) => MonadX.of(n * 2)
);

const resultComposed = composed(3); // First add 1 -> 4, then multiply by 2 -> 8
console.log(resultComposed); // Output: { x: 8 }
