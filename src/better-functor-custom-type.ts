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
// how X fits into the HKT structure given the In, Out2, Out1, Target members defined
// in the parent TypeLambda as placeholders to help produce a specific "type" member
// for XTypeLambda using Kind.

// By defining a TypeLambda for Array, Option, or any custom type like XTypeLambda, you can create
// instances of type classes (like Covariant) that work generically over these structures,
// with the help of Kind to create concrete types (see below).

// XTypeLambda is a specific implementation of TypeLambda that defines the type field to
// be X parameterized only by Target.
// This is conceptually similar to extending URItoKind<A> in fp-ts to include the mapping
// X: X<A>
// the key difference is that fp-ts uses a central registry (URItoKind) as a map for HKTs,
// whereas effect-ts uses a more decentralized approach where each TypeLambda carries
// its own implementation of how it should be interpreted by Kind.
// In effect-ts, the TypeLambda itself dictates the shape through the type member.

// Here we provide a new extension to the parent TypeLambda with a "type" member,
// rather than a new map entry.
// This means we can enforce things in the parent (eg Target's existence), but
// also provide the required type interface (note the existence of "type" is not enforced
// in the TypeLamba interface itself, but Kind will check for it's existence so it is required)
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
    // NOTE: imap's purpose is to show a bidirectional mapping
    // but we only demonstrate one direction A->B, from() is not used to generate B->A 
    (fa, to, _from) => ({ x: to(fa.x) })
  )
};

// Define the doubleAndBang function using map directly
// F must be an HKT (TypeLambda), and also a CovariantType (Functor).
// fa is a kind of HKT F, containing number(s).
// It returns an HKT F, containing string(s).

// Kind takes the HKT F and checks it has a type member (defined in XTypeLambda above)
// It then overlays the values passed to Kind into the TypeLambda (where they are all unknown)
// [technically: intersecting the provided values with the TypeLambda's placeholders]
// These TypeLambda values then drive the value of "type" also defined above to produce X<number>.
// The type field within the TypeLambda uses these parameters to generate the correct type instance.
// Much in the same way as URItoKind<number>(X) would be used in fp-ts
// Kind returns the "type" as the type of fa, below this is F<number>
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
