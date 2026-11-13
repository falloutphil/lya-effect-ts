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

This is a first Civet lesson for someone who knows a little Haskell and a little
Effect. You do not need to know Civet beforehand. Open
[`src/pierre.civet`](src/pierre.civet) alongside this section; the source has
comments explaining the syntax as you encounter it.

The question comes from LYAH's [tightrope routine](https://learnyouahaskell.github.io/a-fistful-of-monads.html#walk-the-line)
and [Either exercise](https://learnyouahaskell.github.io/for-a-few-monads-more.html#error-error-on-the-wall).
We have a sequence of bird landings. Each landing can succeed or fail. Can we
keep that sequence and its inputs unchanged while changing failure from
“Pierre fell” to “Pierre fell with these bird counts”? Here the answer is yes:
one calculation of the landing, one chain, and one choice of interpretation.

### What Civet, TypeScript, and Effect each contribute

[Civet](https://civet.dev/) is a language that compiles to TypeScript or
JavaScript. It gives us indentation-based function bodies, shorter declarations,
and the ability to call a function between its arguments. It can import ordinary
npm packages, including Effect. This repo pins **Civet 0.11.16**, the npm
`latest` release checked on 13 November 2026.

TypeScript describes and checks the shapes of our values and functions. Its
types are erased for execution: `Pole`, `W`, and `PoleOps<W>` are instructions
to the type checker, not objects created when the program runs.

Effect v4 supplies the actual Option and Result values and their operations.
Option fills Haskell's Maybe role; Result fills its Either role. Those are
ordinary values that we compute immediately. Importing them from the `effect`
package does not make them lazy `Effect.Effect` computations or require an
`Effect.run*` call. Node executes the compiled JavaScript and `console.log`
displays the results.

### Why the names sound like Haskell

We deliberately use `pure`, `bind`, `Maybe`, and `Either` as a bridge to LYAH.
These names help you recognise the mechanism before learning Effect's usual
vocabulary. They are local names we choose, not extra exports from Effect.

| Name in this lesson | Haskell connection | Actual Effect operation |
| --- | --- | --- |
| `pure` | `pure` / the `return` used in LYAH: put a value in the context | `Option.some` or `Result.succeed` |
| infix `bind` | `>>=`: feed a successful value into the next contextual function | `Option.flatMap` or `Result.flatMap` |
| `Maybe` | the choice of Maybe-style failure | Our object of Option operations |
| `Either` | the choice of Either-style failure with a reason | Our object of Result operations |

In ordinary Effect code we would generally use the concrete module operations,
such as `Option.some`, `Result.succeed`, and `flatMap`, directly. We would not
usually introduce Haskell names just to rename them. The aliases and explicit
operation objects serve this lesson: they let the shared sequence stay visible
when its interpretation changes.

Also distinguish the adjective **pure** from our variable named `pure`. A pure
calculation such as `move` returns a new value without performing side effects.
The variable `pure` below names a specific function that wraps a successful Pole.
Haskell's `return` in this context is also a wrapping operation, not an early
exit from a function.

### Run it before reading further

After `npm install` (or `npm ci`), run these commands from the repo root:

```bash
# Execute the one example: first Maybe, then Either.
npm run run:pierre:civet

# Alternative: use the installed compiler's command-line runner.
npx civet src/pierre.civet

# Check the Civet source's types without running it.
npm run check:civet
# Equivalent:
npx civet --typecheck src/pierre.civet

# Print the generated TypeScript: -c means compile, -o - means output to stdout.
npx civet -c src/pierre.civet -o -
```

`npm run` selects a command defined in `package.json`. Here the execution command
is `node --import @danielx/civet/register src/pierre.civet`; the registration hook
allows Node to load and compile the Civet source. `npx civet` finds the compiler
installed in this project, so a global Civet installation is unnecessary.
Checking types and executing are separate operations: a runner can execute code
without proving it type-correct. `npm test` does both. See the official
[setup and typechecking documentation](https://civet.dev/getting-started).

The expected output is:

```text
Maybe (Option): { _id: 'Option', _tag: 'None' }
Either (Result): {
  _id: 'Result',
  _tag: 'Failure',
  failure: 'Pierre fell: left=0, right=4'
}
```

Both computations fail at the same landing. The second result tells us more
about that failure. The `_id` fields are Effect's display metadata, and `_tag`
identifies which case of the result we have. Our routine never inspects those
fields; `flatMap` handles success and failure for us.

There are still only twelve TypeScript exercises and **one** Civet exercise.
`npm run check`, `npm run run:examples`, and `npm test` all include it.

### Read the syntax: `:=`, `:`, `=>`, and indentation

Start with the declaration syntax:

```civet
pure := M.of
```

`:=` declares a constant and gives it a value. The TypeScript equivalent is
`const pure = M.of`. It does not call `M.of`; it stores that function under a
local name. Civet lets us omit semicolons. A constant binding cannot be
reassigned, although that alone does not make everything it refers to immutable.

A single colon introduces a type annotation:

```civet
next: Pole := move(side, birds, pole)
```

Read that as “declare the constant `next`, require its value to have type Pole,
and initialise it by calling move.” Its TypeScript form is
`const next: Pole = move(side, birds, pole)`. When the compiler already knows the
type from the function's return type, we can shorten it to `next := ...`, as the
working source does. `:=` declares the binding; `:` describes its type.

An arrow creates a function, and indentation groups its body:

```civet
balanced := ([left, right]: Pole) => Math.abs(left - right) < 4
```

This declares a function named `balanced`. It receives one Pole argument,
unpacks its two elements into `left` and `right`, and returns a boolean. Civet
implicitly returns the final expression. For a body spanning several lines,
the indented block belongs to the function. `//` starts a comment.

In a type definition, however, an arrow **describes** a function rather than
creating one. For example, `(pole: Pole) => W` means “a function taking a Pole
and returning W.” We will use that distinction in `PoleOps`.

### First separate the calculation from failure handling

```civet
type Birds = number
type Pole = readonly [left: Birds, right: Birds]

move := (side: "left" | "right", birds: Birds, [left, right]: Pole): Pole =>
  if side === "left" then [left + birds, right] else [left, right + birds]

balanced := ([left, right]: Pole) => Math.abs(left - right) < 4
```

`type Birds = number` gives a type another name. `Pole` is a tuple: an array
with exactly two positions. Think of Haskell's `(Birds, Birds)`, written with
square brackets here. `left` and `right` label the positions for documentation
and editor assistance. They are not object properties: we access the elements
as `pole[0]` and `pole[1]`, or unpack them as the functions do above.

`readonly` prevents code from assigning through a Pole-typed reference. It does
not freeze the underlying JavaScript array at runtime. `move` creates a fresh
pair rather than modifying the incoming pair. The explicit return type
`: Pole` checks that each branch returns a pair of numbers.

`"left" | "right"` is a union type allowing those two string values. The
`===` in the body compares values. Civet's `if ... then ... else ...` produces
a value, just as Haskell's `if` does. So `move("left", 1, [0, 0])` returns
`[1, 0]`. Negative numbers mean birds leave. `balanced([1, 4])` returns true;
`balanced([0, 4])` returns false because the difference must be **less than** four.

Neither function knows about Option or Result. An unbalanced Pole remains a
perfectly useful value: it describes where Pierre fell. The next layer decides
whether to keep that information.

### What is W? What is `PoleOps<W>`?

`W` is our name for a **type parameter**. It represents the complete wrapped
result of a landing. It is not a runtime variable and is not just the Pole
inside the wrapper. For our two runs:

| Interpretation | W stands for | Successful value | Failed value |
| --- | --- | --- | --- |
| Maybe | `Option.Option<Pole>` | `Option.some([1, 0])` | `Option.none()` |
| Either | `Result.Result<Pole, string>` | `Result.succeed([1, 0])` | `Result.fail("Pierre fell: ...")` |

The repeated names in `Option.Option<Pole>` are ordinary TypeScript module
syntax. The first `Option` is the imported module namespace; `.Option` names
its exported type. `<Pole>` supplies that type's parameter: this Option holds a
Pole. `Option.some` instead selects an exported runtime constructor function.
Likewise, `Result.Result<Pole, string>` is the type, whereas `Result.succeed`
and `Result.fail` construct values.

Notice the argument order: Effect's `Result<success, failure>` corresponds to
Haskell's `Either error value`. Here the success is a Pole and the error is a
string, hence `Result.Result<Pole, string>`.

There is **no `Pole<W>`** in this example. Pole is the ordinary pair. The type
we define is `PoleOps<W>`: the operations associated with one chosen wrapped
result type.

```civet
type PoleOps<W> = {
  of: (pole: Pole) => W
  fail: (pole: Pole) => W
  flatMap: (value: W, next: (pole: Pole) => W) => W
}
```

The braces describe an object with three function fields. `of` receives a
successful Pole and wraps it. `fail` receives a failed candidate Pole and
represents its failure. That name is specific to this little interface; it is
not Haskell's `MonadFail.fail`.

`flatMap` receives a wrapped result **and a function** called `next`. If there
is a successful Pole, it passes that ordinary Pole to `next`; otherwise it
propagates failure. The callback must return W, so the next landing agrees with
the representation already in use. Substituting Option for W makes this
signature read:

```ts
type OptionBind = (
  value: Option.Option<Pole>,
  next: (pole: Pole) => Option.Option<Pole>
) => Option.Option<Pole>;
```

This is an explanatory type declaration, not a function implementation. Substituting
`Result.Result<Pole, string>` gives the corresponding Result signature.

The W in all three fields is the **same type** for a given object. With W fixed
to `Option.Option<Pole>`, for example, returning a Result from `fail` would be a
type error. Each call of the generic routine chooses its own W; the compiler
ensures consistency within that call.

Compared with Haskell's `Monad m`, W is the already-applied type `m Pole`, not
the type constructor `m` itself. Every step here produces another Pole. We do
not need to describe arbitrary changes from `m a` to `m b`, so we can keep this
interface small and avoid higher-kinded-type machinery in the lesson.

### Supply the operations as ordinary objects

```civet
Maybe: PoleOps<Option.Option<Pole>> := {
  of: Option.some
  fail: () => Option.none()
  flatMap: Option.flatMap
}

Either: PoleOps<Result.Result<Pole, string>> := {
  of: Result.succeed
  fail: ([left, right]) => Result.fail(`Pierre fell: left=${left}, right=${right}`)
  flatMap: Result.flatMap
}
```

These are the runtime objects that will supply the operations. We call such an
object a **dictionary** because it collects the functions implementing an
interface. There is no special dictionary runtime: `M.of` simply looks up a
function field on a JavaScript object.

Read the first declaration in pieces: `Maybe` is the constant's name,
`: PoleOps<Option.Option<Pole>>` is its required type, and `:= { ... }` supplies
the object. Civet allows the fields on separate lines without commas. The
annotation gives the compiler enough information to check the fields and infer
the unannotated parameters of the functions inside them.

Most fields reuse Effect functions directly. The Option failure function
`() => Option.none()` deliberately ignores the candidate pole, so its counts
are lost. The Result failure function unpacks that candidate and creates a
message. Backticks delimit a JavaScript template string; `${left}` and
`${right}` insert values into it.

Crucially, Effect's two `flatMap` functions handle propagation. Option calls the
callback for Some and skips it for None. Result calls it for Success and skips
it for Failure, retaining the failure value. We don't implement either of those
rules ourselves.

### Build the landing functions in stages

```civet
makeLanding := <W>(M: PoleOps<W>, side: "left" | "right") =>
  (birds: Birds) => (pole: Pole): W =>
    next := move(side, birds, pole)
    if balanced(next) then M.of(next) else M.fail(next)
```

`<W>` declares this function's type parameter. `M` is a normal runtime parameter:
the object supplying the functions. Its annotation `PoleOps<W>` connects that
object's operations to the wrapped type the compiler tracks.

Each arrow creates another function. First we choose M and a side; then we
choose the number of birds; finally we receive the previous pole. For example:

```civet
landLeft := makeLanding Maybe, "left"
oneBirdOnLeft := landLeft(1)
newPole := oneBirdOnLeft([0, 0])
```

These are explanatory steps inside the same example, not another exercise.
`landLeft` remembers the interpreter and side. `oneBirdOnLeft` additionally
remembers the bird count and waits for a Pole. Called with `[0, 0]`, it computes
`[1, 0]`, checks balance, then returns `Option.some([1, 0])`.

This is explicit currying. Unlike Haskell, Civet does not automatically turn
every multi-argument function into a chain of single-argument functions. We
wrote the separate arrows ourselves. The initial `makeLanding` call takes
**two arguments at once**: `makeLanding Maybe, "left"` is shorthand for
`makeLanding(Maybe, "left")`. Keep that comma. Haskell's `f x y` and Civet's
implicit-call syntax are not interchangeable in general.

`makeLanding` always calls the same pure `move` and `balanced` functions. Only
`M.of(next)` versus `M.fail(next)` interprets the decision. The candidate is
still available at the point we construct failure, so Result can retain it.

### Read the unchanged chain

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

The function receives M once. `operator bind := M.flatMap` declares a function
alias and tells Civet that it may appear between its two arguments. Thus
`wrapped bind landLeft(1)` means `bind(wrapped, landLeft(1))`. The name is a
bridge to Haskell's `>>=`. It is not a special Effect operator or a call to
Option's record-building `bind` API.

Custom infix operators are left-associative by default. Consequently,
`a bind f bind g` means `bind(bind(a, f), g)`. For orientation, the first two
landings in our chain amount to these ordinary TypeScript calls:

```ts
const start = M.of([0, 0]);
const first = M.flatMap(start, landLeft(1));
const second = M.flatMap(first, landRight(4));
```

The full generated expression nests four such calls. The grouping parentheses
around the Civet chain keep its implicit return together. With the installed
compiler, leaving this multiline expression ungrouped generated a bare `return`
followed by a newline and returned `undefined`. The grouped form in the source
has been compiled, type-checked, and executed. You can inspect it with the
compile command above. The official [infix operator reference](https://civet.dev/reference#functions-as-infix-operators)
describes how the function calls and associativity work.

### Choose once, then follow both runs

```civet
maybeLanding := pierre Maybe
eitherLanding := pierre Either
```

An implicit call with one argument needs no parentheses: these mean
`pierre(Maybe)` and `pierre(Either)`. TypeScript infers the resulting types as
`Option.Option<Pole>` and `Result.Result<Pole, string>`. We keep the dictionary
annotations, which establish the agreement between operations, and let the
compiler carry that information to the results. W is a compile-time parameter;
at runtime the choice is implemented by passing different function objects.

Both runs use exactly the same starting pair and bird counts:

| Step | Candidate pole | Balance | What happens |
| --- | --- | --- | --- |
| Start | `[0, 0]` | balanced | Wrap with Some / Success |
| Left 1 | `[1, 0]` | difference 1 | Continue |
| Right 4 | `[1, 4]` | difference 3 | Continue |
| Left -1 | `[0, 4]` | difference 4 | Produce None / Failure with counts |
| Right -2 | Not calculated | Not checked | Landing callback skipped |

Because JavaScript evaluates the nested bind calls eagerly, the final bind
still receives the failed result and returns it. What is skipped is the
landing callback's calculation on a Pole. Constructing `landRight(-2)` creates
a function; it does not yet move any birds. Its body never runs on this path.
That is why a later move cannot restore balance after a fall.

Option discards the failed candidate; Result keeps its counts in the error
message. We do not first calculate None and then try to recover a reason from
it. The representation is selected when each landing produces its outcome.

For a small experiment, change the `4` in the one routine to `3` and rerun.
Both interpretations now complete at `[0, 1]`, one with Some and one with
Success. The committed example retains `4` so that the richer failure is visible.

The similarity to LYAH is the separation: the same sequencing and inputs can
use different success/failure operations. The difference is instance selection.
Haskell's typeclass machinery selects the implementation from types; here we
pass the dictionary explicitly. Civet makes the syntax concise, but it does not
add Haskell's typeclass resolution or native higher-kinded types to TypeScript.


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
