// -*- compile-command: "npx ts-node better-functor-custom-type.ts" -*-

import { dual } from "effect/Function";
import * as A from "@effect/typeclass/data/Array"; // Importing Covariant instance for arrays
import * as Covariant from "@effect/typeclass/Covariant"; // Importing Covariant (equivalent to Functor)
import type { Covariant as CovariantType } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

// Define the custom type X
type X<A> = {
  x: A;
};

// Define the URI for X
interface XTypeLambda extends TypeLambda {
  readonly type: X<this["Target"]>;
}

// Define the Covariant (Functor) instance for X using the correct signature for imap
const CovariantX: CovariantType<XTypeLambda> = {
  map: dual(
    2,
    <A, B>(fa: X<A>, f: (a: A) => B): X<B> => ({ x: f(fa.x) })
  ),
  imap: dual(
    3,
    <A, B>(fa: X<A>, to: (a: A) => B, _from: (b: B) => A): X<B> => ({ x: to(fa.x) })
  )
};

// Curried map function for any Covariant
function curriedMap<F extends TypeLambda>(
  covariant: CovariantType<F>
): <A, B>(f: (a: A) => B) => (fa: Kind<F, unknown, unknown, unknown, A>) => Kind<F, unknown, unknown, unknown, B> {
  return <A, B>(f: (a: A) => B) => (fa: Kind<F, unknown, unknown, unknown, A>) => covariant.map(fa, f);
}

// Define the doubleAndBang function using the curried map
function doubleAndBang<F extends TypeLambda>(
  covariant: CovariantType<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
): Kind<F, unknown, unknown, unknown, string> {
  const myMap = curriedMap(covariant);
  return myMap((n: number) => `${n * 2}!`)(fa);
}

// Use with custom type X
const xValue: X<number> = { x: 2 };
const xRes = doubleAndBang(CovariantX, xValue);
console.log(xRes); // Output: { x: "4!" }

// Use with Array from effect-ts
const arrayValue: Array<number> = [1, 2, 3];
const arrayRes = doubleAndBang(A.Covariant, arrayValue);
console.log(arrayRes); // Output: ["2!", "4!", "6!"]
