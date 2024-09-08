// -*- compile-command: "npx ts-node optional-effect.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
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
const incremented = increment(O.Covariant, someValue);
console.log(incremented); // Output: Some(6)

// Use the Array-specific Covariant instance
const arrayValue = [1, 2, 3, 4];
const arrayIncremented = increment(A.Covariant, arrayValue);
console.log(arrayIncremented); // Output: [2, 3, 4, 5]
