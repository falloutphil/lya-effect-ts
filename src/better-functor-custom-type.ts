// -*- compile-command: "npx ts-node better-functor-custom-type.ts" -*-

import { dual, pipe } from "effect/Function";
import * as A from "@effect/typeclass/data/Array"; // Importing Covariant instance for arrays
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

// Define the Covariant (Functor) instance for X
// dual allows us to use it both as a regular function
// and a curried function - dual(arity, func)
const CovariantX: CovariantType<XTypeLambda> = {
  map: dual(
    2,
    (fa, f) => ({ x: f(fa.x) })
  ),
  imap: dual(
    3,
    (fa, to, _from) => ({ x: to(fa.x) })
  )
};

// Define the doubleAndBang function using map directly
function doubleAndBang<F extends TypeLambda>(
  covariant: CovariantType<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
) {
  return pipe(
    fa,
    covariant.map((n: number) => `${n * 2}!`)
  );
}

// Use with custom type X
const xValue: X<number> = { x: 2 };
const xRes = doubleAndBang(CovariantX, xValue);
console.log(xRes); // Output: { x: "4!" }

// Use with Array from effect-ts
const arrayValue: Array<number> = [1, 2, 3];
const arrayRes = doubleAndBang(A.Covariant, arrayValue);
console.log(arrayRes); // Output: ["2!", "4!", "6!"]
