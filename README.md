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

## Requirements

- Node.js
- npm

## Setup

From the repo root:

```bash
npm install
```

## Check The Repo

Type-check all examples:

```bash
npm run check
```

This runs:

```bash
tsc --noEmit
```

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
```

Each source file also has a file-local `compile-command` header for Emacs.
Those headers are written to work with `M-x compile` from the file buffer in
`src/`, so they use `npx tsx <file>.ts` rather than `npx tsx src/<file>.ts`.

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
   The same general idea across `Option`, `Either`, and `Array`.

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
