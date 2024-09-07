// -*- compile-command: "npx ts-node optional-effect.ts" -*-

import { Covariant as OptionCovariant } from "@effect/typeclass/data/Option";
import { Covariant as ArrayCovariant } from "@effect/typeclass/data/Array";
import { some } from "effect/Option";
import type { Covariant } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

// Generic increment function using the generic Covariant interface
function increment<F extends TypeLambda>(
  covariant: Covariant<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
): Kind<F, unknown, unknown, unknown, number> {
  return covariant.map(fa, (x) => x + 1);
}

// Use the Option-specific Covariant instance
const someValue = some(5);
const incremented = increment(OptionCovariant, someValue);
console.log(incremented); // Output: Some(6)

const arrayValue = [1,2,3,4]
const arrayIncremented = increment(ArrayCovariant, arrayValue)
console.log(arrayIncremented); // [2,3,4,5]
