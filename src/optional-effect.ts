import { Covariant } from "@effect/typeclass/Covariant";
import type { Kind, TypeLambda } from "effect/HKT";

// Define the increment function
function increment<F extends TypeLambda>(
  covariant: Covariant<F>,
  fa: Kind<F, unknown, unknown, unknown, number>
): Kind<F, unknown, unknown, unknown, number> {
  // Use the covariant's map method to add 1 to each element inside the functor
  return covariant.map(fa, (x) => x + 1);
}

