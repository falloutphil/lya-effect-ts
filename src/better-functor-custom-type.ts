// -*- compile-command: "npx ts-node better-functor-custom-type.ts" -*-

import { dual, pipe } from "effect/Function";
import * as A from "@effect/typeclass/data/Array"; // Importing Covariant instance for arrays
import type { Covariant as CovariantType } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

// Define the custom HKT X
type X<A> = {
  x: A;
};

// A TypeLambda represents X as an HKT. By extending TypeLambda, XTypeLambda defines
// how X fits into the HKT structure (which defined "Target" etc).
interface XTypeLambda extends TypeLambda {
  readonly type: X<this["Target"]>;
}

// Define the Covariant (Functor) instance for X's HKT.
// dual allows us to use it both as a regular function
// and a curried function - dual(arity, func)
const CovariantX: CovariantType<XTypeLambda> = {
  map: dual(
    2,
    (fa, f) => ({ x: f(fa.x) })
  ),
  imap: dual(
    3,
    (fa, to, _from) => ({ x: to(fa.x) }) // NOTE: We only demonstrate one direction A->B, from() is not used for B->A
  )
};

// Define the doubleAndBang function using map directly
// F must be an HKT (TypeLambda), and also a CovariantType (Functor).
// fa is a kind of HKT F, containing number(s).
// It returns an HKT F, containing string(s).
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
