// Small teaching interfaces owned by this repo, not an official Effect v4 package.
// See ../../notes/effect-v4-migration.md for the v3 versions and the rationale.
import { dual } from "effect/Function";
import type { Kind, TypeClass, TypeLambda } from "effect/HKT";
import * as Combiner from "effect/Combiner";

// The overloads preserve both map(fa, f) and pipe(fa, map(f)).
export interface Covariant<F extends TypeLambda> extends TypeClass<F> {
  readonly map: {
    <A, B>(
      f: (a: A) => B,
    ): <R, O, E>(fa: Kind<F, R, O, E, A>) => Kind<F, R, O, E, B>;
    <R, O, E, A, B>(
      fa: Kind<F, R, O, E, A>,
      f: (a: A) => B,
    ): Kind<F, R, O, E, B>;
  };
  // A covariant container can implement invariant mapping using only `to`.
  // `from` remains part of the contract; it is not an inverse we execute here.
  readonly imap: {
    <A, B>(
      to: (a: A) => B,
      from: (b: B) => A,
    ): <R, O, E>(fa: Kind<F, R, O, E, A>) => Kind<F, R, O, E, B>;
    <R, O, E, A, B>(
      fa: Kind<F, R, O, E, A>,
      to: (a: A) => B,
      from: (b: B) => A,
    ): Kind<F, R, O, E, B>;
  };
}

export interface FlatMap<F extends TypeLambda> extends TypeClass<F> {
  readonly flatMap: {
    <A, R2, O2, E2, B>(
      f: (a: A) => Kind<F, R2, O2, E2, B>,
    ): <R1, O1, E1>(
      fa: Kind<F, R1, O1, E1, A>,
    ) => Kind<F, R1 & R2, O1 | O2, E1 | E2, B>;
    <R1, O1, E1, A, R2, O2, E2, B>(
      fa: Kind<F, R1, O1, E1, A>,
      f: (a: A) => Kind<F, R2, O2, E2, B>,
    ): Kind<F, R1 & R2, O1 | O2, E1 | E2, B>;
  };
}

export interface Of<F extends TypeLambda> extends TypeClass<F> {
  readonly of: <A>(value: A) => Kind<F, unknown, never, never, A>;
}

export interface Monad<F extends TypeLambda>
  extends Covariant<F>, FlatMap<F>, Of<F> {}

// product combines independent contexts. Arrays use a Cartesian product;
// Option requires both operands to be Some.
export interface SemiApplicative<F extends TypeLambda> extends Covariant<F> {
  readonly product: <R1, O1, E1, A, R2, O2, E2, B>(
    fa: Kind<F, R1, O1, E1, A>,
    fb: Kind<F, R2, O2, E2, B>,
  ) => Kind<F, R1 & R2, O1 | O2, E1 | E2, [A, B]>;
}

export interface Applicative<F extends TypeLambda>
  extends SemiApplicative<F>, Of<F> {}

export const imapFromMap = <F extends TypeLambda>(
  map: Covariant<F>["map"],
): Covariant<F>["imap"] =>
  dual(
    3,
    <R, O, E, A, B>(
      fa: Kind<F, R, O, E, A>,
      to: (a: A) => B,
      _from: (b: B) => A,
    ) => map(fa, to),
  );

// These helpers derive behaviour solely from the supplied dictionary.
export const flatten =
  <F extends TypeLambda>(F: FlatMap<F>) =>
  <R1, O1, E1, R2, O2, E2, A>(
    ffa: Kind<F, R1, O1, E1, Kind<F, R2, O2, E2, A>>,
  ) =>
    F.flatMap(ffa, (fa) => fa);

export const zipRight =
  <F extends TypeLambda>(F: FlatMap<F>) =>
  <R1, O1, E1, A, R2, O2, E2, B>(
    fa: Kind<F, R1, O1, E1, A>,
    fb: Kind<F, R2, O2, E2, B>,
  ) =>
    F.flatMap(fa, () => fb);

export const composeK =
  <F extends TypeLambda>(F: FlatMap<F>) =>
  <A, R1, O1, E1, B, R2, O2, E2, C>(
    first: (a: A) => Kind<F, R1, O1, E1, B>,
    second: (b: B) => Kind<F, R2, O2, E2, C>,
  ) =>
  (a: A) =>
    F.flatMap(first(a), second);

// ap applies a contextual function to a contextual argument.
export const ap =
  <F extends TypeLambda>(F: SemiApplicative<F>) =>
  <R2, O2, E2, A>(fa: Kind<F, R2, O2, E2, A>) =>
  <R1, O1, E1, B>(fab: Kind<F, R1, O1, E1, (a: A) => B>) =>
    F.map(F.product(fab, fa), ([f, a]) => f(a));

export const lift2 =
  <F extends TypeLambda>(F: SemiApplicative<F>) =>
  <A, B, C>(f: (a: A, b: B) => C) =>
  <R1, O1, E1, R2, O2, E2>(
    fa: Kind<F, R1, O1, E1, A>,
    fb: Kind<F, R2, O2, E2, B>,
  ) =>
    F.map(F.product(fa, fb), ([a, b]) => f(a, b));

export const getCombiner =
  <F extends TypeLambda>(F: SemiApplicative<F>) =>
  <A>(
    combiner: Combiner.Combiner<A>,
  ): Combiner.Combiner<Kind<F, unknown, never, never, A>> =>
    Combiner.make(lift2(F)(combiner.combine));
