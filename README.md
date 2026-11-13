# lya-effect-ts

Small Effect / typeclass / monad teaching examples inspired by the style of
*Learn You a Haskell for Great Good!* and used as a companion learning repo for
`ta-app`.

This repo is not a production application. It is a runnable playground for a
few specific ideas:

- `Option` / `Maybe` intuition
- Pierre and the birds
- `map`, applicative lifting, and `flatMap`
- monadic sequencing
- generic typeclass-style abstractions
- small custom functor / monad examples

The runnable examples use **Effect 4.1.4**, pinned in `package.json`. Effect v4
retains HKT but removes the `@effect/typeclass` package. This repo defines the
small set of generic teaching interfaces it needs in
[`src/teaching/typeclasses.ts`](src/teaching/typeclasses.ts), with v4 instances in
[`src/teaching/instances.ts`](src/teaching/instances.ts). These are local teaching
definitions, not an official v4 typeclass library.

Read [the v3 → v4 migration notes](notes/effect-v4-migration.md) for old/new code,
the techniques we preserved, the two meanings of optional combination, and the
observed results of every script.

## Requirements

- Node.js 24 (used for the migration checks)
- npm

## Setup

From the repo root:

```bash
npm install
```

For an install using exactly the committed lockfile, use `npm ci`.

## Check The Repo

Type-check all examples:

```bash
npm run check
```

This checks both the TypeScript exercises and the single Civet exercise:

```bash
tsc --noEmit
npm run check:civet
```

Type-check and run every example together:

```bash
npm test
```

The examples themselves are the exercises and checks; there is no separate unit
test suite. The runner stops if any script fails. Compare the printed values
with the [recorded TypeScript results](notes/effect-v4-migration.md#verification-and-observed-results)
and the [Civet results below](#civet-one-pierre-routine-maybe-or-either).

## Run Every Example

Run all exercises in sequence:

```bash
npm run run:examples
```

## Run One Exercise At A Time

From the repo root, run an individual exercise like this:

```bash
npx tsx src/applicative.ts
npx tsx src/basic-custom-monad.ts
npx tsx src/better-functor-custom-type.ts
npx tsx src/curry.ts
npx tsx src/effect-do-notation.ts
npx tsx src/generic-monad.ts
npx tsx src/monoid-flatten-array.ts
npx tsx src/monoid-flatten-optional-array.ts
npx tsx src/monoid-ordering.ts
npx tsx src/optional-effect.ts
npx tsx src/optional-standalone.ts
npx tsx src/pierre-monad.ts
npm run run:pierre:civet
```

Each source file also has a file-local `compile-command` header for Emacs.
Those headers are written to work with `M-x compile` from the file buffer in
`src/`. The TypeScript headers use `npx tsx <file>.ts`; the Civet header runs its
npm script from the parent directory.

## Civet: one Pierre routine, Maybe or Either

[Civet](https://civet.dev/) is a language that compiles to TypeScript or
JavaScript. It interoperates with npm packages, so this example uses the same
Effect v4 Option and Result values as the TypeScript exercises. Civet supplies
shorter syntax and custom infix function calls; Effect supplies the actual
success, failure, and sequencing behaviour. It is a development dependency,
not a new runtime abstraction around Effect. This repo pins **Civet 0.11.16**,
the npm `latest` version checked on 13 November 2026.

There is exactly one Civet exercise:
[`src/pierre.civet`](src/pierre.civet). Read it after the TypeScript Pierre
example. It follows LYAH's [tightrope routine](https://learnyouahaskell.github.io/a-fistful-of-monads.html#walk-the-line)
and [Either exercise](https://learnyouahaskell.github.io/for-a-few-monads-more.html#error-error-on-the-wall):
the landings and their order stay the same when failure gains an explanation.
The sequencing code does not acquire error checks or a different pipeline.

### Run, check, and inspect it

After `npm install` (or `npm ci`), from the repo root:

```bash
# Run the one example: first Maybe, then Either.
npm run run:pierre:civet

# Equivalent direct invocation using the installed Civet CLI.
npx civet src/pierre.civet

# Check its types, including the generated TypeScript.
npm run check:civet
# Equivalent:
npx civet --typecheck src/pierre.civet

# Print the generated TypeScript for inspection, without writing a second example.
npx civet -c src/pierre.civet -o -
```

The npm run script uses Node's Civet registration hook:
`node --import @danielx/civet/register src/pierre.civet`. The hook compiles the
source for execution. The direct `npx civet` command is an alternative frontend
to the installed compiler; no global installation is needed. See Civet's
[setup and typechecking documentation](https://civet.dev/getting-started).
`npm run check`, `npm run run:examples`, and `npm test` all include this example.
There are twelve TypeScript exercises and one Civet exercise.

### The sequence stays written once

The actual routine is:

```civet
pierre := <W>(M: PoleOps<W>): W =>
  operator bind := M.flatMap
  pure := M.of
  landLeft := makeLanding M, "left"
  landRight := makeLanding M, "right"

  (pure([0, 0])
    bind landLeft(1)
    bind landRight(4)
    bind landLeft(-1)
    bind landRight(-2))
```

`operator bind := M.flatMap` makes the selected function usable between its
arguments. Civet's custom operators are left-associative by default, so the
first landing's result flows into the next bind, and so on. Each bind decides
whether to call the next landing or propagate the existing failure. The
compiler turns the chain into nested function calls; it does not implement a
separate monad runtime. See [Civet's infix operator reference](https://civet.dev/reference#functions-as-infix-operators).

The surrounding parentheses matter with the installed compiler: an ungrouped
multiline infix chain in an implicit return generated a bare `return` followed
by a newline, which JavaScript interpreted as returning `undefined`. Grouping
keeps the generated return expression together. The committed form has been
compiled, type-checked, and executed, rather than inferred from the syntax docs.

Civet also lets us use implicit function calls (`pierre Maybe`), implicit
returns, destructured tuple parameters, and `if` as an expression. These shorten
the landing calculation as well as the chain. TypeScript's readonly named
tuple, `readonly [left: Birds, right: Birds]`, describes the two positions and
prevents mutation through a Pole value. The typed `next: Pole` declaration
checks that both branches construct a pair. No `any`, casts, compiler-error
suppression, or generated source committed to the repo is needed here.

### Change the interpretation, not the routine

`PoleOps<W>` describes the three operations this routine needs: wrap a
successful Pole, represent a failed Pole, and sequence a wrapped Pole with a
function producing another wrapped Pole. `makeLanding` calculates the candidate
pole once and checks the same balance rule for either interpretation:

```civet
makeLanding := <W>(M: PoleOps<W>, side: "left" | "right") =>
  (birds: Birds) => ([left, right]: Pole): W =>
    next: Pole := if side === "left" then [left + birds, right] else [left, right + birds]
    if Math.abs(next[0] - next[1]) < 4 then M.of(next) else M.fail(next)
```

For Maybe, `of` is `Option.some`, failure returns `Option.none()`, and bind is
`Option.flatMap`. For Either, `of` is `Result.succeed`, failure returns
`Result.fail` with the bird counts, and bind is `Result.flatMap`. Result is
Effect v4's name for the Either role; the local name `Either` makes the Haskell
comparison explicit. Both dictionaries are checked against their concrete
`PoleOps` types, and `pierre` preserves the selected wrapper type in its result.

The only difference at the call site is the chosen interpretation:

```civet
maybeLanding: Option.Option<Pole> := pierre Maybe
eitherLanding: Result.Result<Pole, string> := pierre Either
```

Both runs start at `(0,0)`, then try `(1,0)`, `(1,4)`, and `(0,4)`. That last
candidate has a difference of four, violating the strict `< 4` rule. The final
right-side removal of two birds would restore balance, but its landing
callback is never executed: Pierre has already fallen. Both interpretations
stop at the same point. Their observed outputs are:

```text
Maybe (Option): { _id: 'Option', _tag: 'None' }
Either (Result): {
  _id: 'Result',
  _tag: 'Failure',
  failure: 'Pierre fell: left=0, right=4'
}
```

The richer result comes from changing how failure is represented at the
landing step. We do not convert an already-computed None into a Result and
try to reconstruct the lost counts afterwards. No Result-specific branch
appears in the routine or in the shared balance calculation.

This achieves the separation illustrated by LYAH, with an explicit dictionary
argument in place of Haskell's automatic instance selection. It is generic
over the wrapped Pole, rather than a complete `Monad m` interface that can
change arbitrary `A` values into `B` values. That narrower contract is enough
for every step here and avoids extra HKT machinery in this single example.
The other exercises still demonstrate full HKT-based interfaces. Civet adds
syntax; it does not add Haskell's typeclass resolution or native higher-kinded
types to TypeScript.

## Suggested Reading Order

If you are using this repo to support learning in `ta-app`, this is a good
order.

1. `src/optional-standalone.ts`
   First-principles `Option` mechanics with no Effect dependency.

2. `src/pierre-monad.ts`
   The Pierre / birds example. Best intuition-builder for monadic failure and
   chaining.

3. `src/effect-do-notation.ts`
   A small step from `Option` chaining toward readable monadic sequencing.

4. `src/optional-effect.ts`
   `map`, lifting, and applicative-style composition over `Option`.

5. `src/generic-monad.ts`
   The same general idea across `Option`, `Result` (v3's `Either`), and `Array`.

6. `src/basic-custom-monad.ts`
   Small custom monad example.

7. `src/better-functor-custom-type.ts`
   Small custom covariant / functor example.

8. `src/applicative.ts`
   More advanced applicative experimentation.

9. `src/monoid-flatten-array.ts`
   Monoid flattening for arrays.

10. `src/monoid-flatten-optional-array.ts`
    Monoid flattening in an optional context.

11. `src/monoid-ordering.ts`
    Ordering composition example.

12. `src/curry.ts`
    Utility exploration for currying variadic functions.

## What This Repo Is And Is Not

This repo is:

- a teaching sandbox
- a companion to the `ta-app` handbook
- a place to make abstract ideas smaller and easier to inspect

This repo is not:

- the architecture of `ta-app`
- a production codebase
- a full survey of the Effect ecosystem

Its job is narrower: make key compositional ideas runnable and easier to see.
