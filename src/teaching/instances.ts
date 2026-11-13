// Dictionaries for the teaching interfaces. All data and operations are v4.
import * as Array from "effect/Array";
import * as Option from "effect/Option";
import * as Result from "effect/Result";
import { imapFromMap } from "./typeclasses";
import type {
  Applicative,
  Covariant,
  Monad,
  SemiApplicative,
} from "./typeclasses";

const optionCovariant: Covariant<Option.OptionTypeLambda> = {
  map: Option.map,
  imap: imapFromMap<Option.OptionTypeLambda>(Option.map),
};
const arrayCovariant: Covariant<Array.ReadonlyArrayTypeLambda> = {
  map: Array.map,
  imap: imapFromMap<Array.ReadonlyArrayTypeLambda>(Array.map),
};
const resultCovariant: Covariant<Result.ResultTypeLambda> = {
  map: Result.map,
  imap: imapFromMap<Result.ResultTypeLambda>(Result.map),
};

const optionApplicative: Applicative<Option.OptionTypeLambda> = {
  ...optionCovariant,
  of: Option.some,
  product: Option.product,
};
const arrayApplicative: Applicative<Array.ReadonlyArrayTypeLambda> = {
  ...arrayCovariant,
  of: Array.of,
  // Keep functions/left choices in the outer loop, matching the v3 Array instance.
  product: (fa, fb) => Array.flatMap(fa, (a) => Array.map(fb, (b) => [a, b])),
};

export const OptionInstances = {
  Covariant: optionCovariant,
  Monad: {
    ...optionCovariant,
    of: Option.some,
    flatMap: Option.flatMap,
  } satisfies Monad<Option.OptionTypeLambda>,
  Applicative: optionApplicative,
  SemiApplicative:
    optionApplicative satisfies SemiApplicative<Option.OptionTypeLambda>,
};
export const ArrayInstances = {
  Covariant: arrayCovariant,
  Monad: {
    ...arrayCovariant,
    of: Array.of,
    flatMap: Array.flatMap,
  } satisfies Monad<Array.ReadonlyArrayTypeLambda>,
  Applicative: arrayApplicative,
};
export const ResultInstances = {
  Covariant: resultCovariant,
  Monad: {
    ...resultCovariant,
    of: Result.succeed,
    flatMap: Result.flatMap,
  } satisfies Monad<Result.ResultTypeLambda>,
};
