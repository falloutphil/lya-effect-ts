import * as O from "@effect/data/Option";
import { Covariant } from "@effect/typeclass";
import { pipe } from "@effect/data/Function";

// Define the TypeLambda for Option
interface OptionTypeLambda extends O.TypeLambda {
  readonly type: O.Option<this["Target"]>;
}

// Define the Covariant instance for Option
const optionCovariant: Covariant<OptionTypeLambda> = {
  map: (fa, f) => O.map(fa, f),
};

// Define the increment function using Covariant
function increment<F extends Covariant<any>>(
  covariant: Covariant<F>,
  fa: F<number>
): F<number> {
  return covariant.map(fa, (x) => x + 1);
}

// Example usage with Option
const someValue: O.Option<number> = O.some(5);
const incremented = increment(optionCovariant, someValue);

console.log(incremented); // Output: Some(6)
