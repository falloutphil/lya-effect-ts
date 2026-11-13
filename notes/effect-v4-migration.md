# Effect v3 → v4: preserving the lessons

This repo moves from **Effect 3.21.2** to **Effect 4.1.4**, the npm `latest` release checked on
13 November 2026. The runtime version is pinned exactly. The language service
moves from 0.86.2 to 0.87.5, and the lockfile removes `@effect/data` and
`@effect/typeclass`. The migration was checked with Node 24.22.1 and TypeScript
5.9.3. The [ta-app migration report](../../ta-app/notes/implementation/effect-4-migration-report.md)
provided background, but its Effect 4.0.6 pin was not copied: the installed
4.1.4 declarations and implementation were the API authority for this repo.

The purpose stays the same: make the functional programming ideas from
*Learn You a Haskell for Great Good!* small enough to run and inspect. We keep
generic functor, applicative, and monad examples alongside concrete Option
examples. Moving to v4 does not require turning every generic example into
separate Option and Array programs.

## What changed upstream, and what we own now

V3 supplied two distinct things. `effect/HKT` encoded type constructors so that
TypeScript could describe a container without fixing which container it was.
The separate `@effect/typeclass` package supplied interfaces such as `Monad`
and `Applicative`, instance dictionaries such as `Option.Monad`, and derived
helpers such as `flatten` and `lift2`.

V4 retains the HKT encoding but removes that generic typeclass package. It
provides concrete operations on Option, Result, Array, and other data types.
It also provides `Combiner` and `Reducer` for common combining and folding
operations. There is no official v4 replacement for the entire generic
typeclass hierarchy. See the upstream [migration reference](https://github.com/Effect-TS/effect/blob/main/migration/v3-to-v4.md)
and [HKT source](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/HKT.ts).

Consequently, this repo owns a small set of teaching definitions in
[`src/teaching/typeclasses.ts`](../src/teaching/typeclasses.ts) and dictionaries
in [`src/teaching/instances.ts`](../src/teaching/instances.ts). They cover only
the operations these exercises use. They are not a port of the old package,
an official Effect API, or a complete typeclass hierarchy. TypeScript checks
the operation signatures; it does not prove the functor, applicative, or monad
laws. The definitions use v4 data types and operations throughout.

## HKT still describes the container

This custom type and its type lambda work the same way in both versions:

```ts
import type { Kind, TypeLambda } from "effect/HKT";

type X<A> = { x: A };

interface XTypeLambda extends TypeLambda {
  readonly type: X<this["Target"]>;
}

type NumberInX = Kind<XTypeLambda, unknown, never, never, number>;
// NumberInX is X<number>, i.e. { x: number }.
```

`TypeLambda` supplies placeholders. `XTypeLambda` says how its `Target`
placeholder produces a concrete type. `Kind` fills the placeholders and reads
the resulting `type` member. This is a compile-time calculation: no container
object is constructed until an ordinary runtime function creates one.

The other placeholders (`In`, `Out2`, and `Out1`) let a type constructor carry
additional inputs and outputs. Option and Array only use `Target`; v4 Result
uses `Target` for success and `Out1` for failure. The local interfaces preserve
all the parameters rather than erasing them to `any`. In `flatMap`, input
requirements intersect and the two output channels form unions. The concrete
type lambda determines which channels its data type actually uses.

The standalone `URItoKind` example remains in
[`optional-standalone.ts`](../src/optional-standalone.ts). It demonstrates the
alternative, central-registry encoding without importing Effect. Keeping it
lets you compare that technique with Effect's separate type lambdas.

## Generic mapping and monadic sequencing

In v3, the generic interface and the Option dictionary came from the package:

```ts
// Historical v3 code.
import type { Monad } from "@effect/typeclass/Monad";
import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";

const resultOption = monadicChain(O.Monad);
const resultArray = monadicChain(A.Monad);
```

The current example imports the definitions this repo owns:

```ts
import type { Monad } from "./teaching/typeclasses";
import {
  OptionInstances as O,
  ArrayInstances as A
} from "./teaching/instances";

const resultOption = monadicChain(O.Monad);
const resultArray = monadicChain(A.Monad);
```

The dictionary is simply an object containing operations. The Option dictionary
supplies `Option.some` as `of`, `Option.map` as `map`, and `Option.flatMap` as
`flatMap`. Array supplies its own corresponding operations. A generic function
receives the dictionary explicitly. Haskell normally resolves the instance
implicitly; TypeScript does not gain that behaviour through HKT.

For the worked example in [`generic-monad.ts`](../src/generic-monad.ts), `of(10)`
starts the computation. `flatMap` passes the contained `10` to the addition
step, which returns `of(15)`. Multiplication returns `of(45)`, and subtraction
returns `of(35)`. The algorithm stays the same; the chosen dictionary determines
the container. The outputs remain `Some(35)` and `[35]`.

Those steps all wrap successful arithmetic. They intentionally demonstrate
generic sequencing rather than interesting failure or branching. Pierre's
example shows why a concrete operation might return `None` and cause the rest
of the chain to be skipped.

The custom `X` examples still construct their own `Covariant` and `Monad`
instances. They keep both `map` and `imap`. Covariant mapping only needs the
forward function, so its `imap` implementation ignores the backward function;
it does not claim to execute a round trip or validate an inverse.

The local signatures and Effect's `dual` helper also preserve both calling
styles:

```ts
covariant.map(fa, (n: number) => n + 1);
pipe(fa, covariant.map((n: number) => n + 1));
```

The first call receives the data immediately. The second creates a function
waiting for the data, which `pipe` supplies. This technique survives the
package removal.

## Either becomes Result

V3's `@effect/typeclass/data/Either` dictionary has no v4 counterpart. The
underlying data type also changes names:

```ts
// Historical v3 construction.
Either.right(35);     // Right(35)
Either.left("stop");  // Left("stop")

// V4 construction.
Result.succeed(35);   // Success(35)
Result.fail("stop");  // Failure("stop")
```

The current `ResultInstances.Monad` delegates to `Result.succeed`, `Result.map`,
and `Result.flatMap`. Its generic chain returns `Success(35)`. This is an
intentional change to the printed wrapper and heading, while preserving the
success value. We do not keep an alias pretending that v4 still supplies Either.

## Deriving helpers from a small interface

V3 supplied these helpers as library functions:

```ts
// Historical v3 imports.
import { flatten, zipRight, composeK } from "@effect/typeclass/FlatMap";
import * as SA from "@effect/typeclass/SemiApplicative";

flatten(MonadX)(nested);
SA.ap(A.Applicative)(liftedArgument)(liftedFunction);
```

Our local module keeps the techniques visible. `flatten` is a `flatMap` whose
callback returns the inner container unchanged. `zipRight` uses `flatMap` to
discard the first successful value and return the second container. `composeK`
calls the first contextual function and flatMaps its result into the second.

Applicative application needs independent contexts rather than a callback
that chooses the next context. Our `SemiApplicative` interface therefore
provides `product`, alongside mapping. `product` combines two contexts into a
context containing a pair. `ap` then maps over that pair to call its function:

```ts
// The core operation inside the local ap implementation.
F.map(F.product(fab, fa), ([f, a]) => f(a));
```

For Option, both operands must be Some. For Array, `product` enumerates all
pairs, with left choices in the outer loop and right choices in the inner
loop, preserving the old instance's order. `lift2` uses the same pairing
operation to lift an ordinary binary function. These definitions explain how
the helpers arise from the operations in the dictionary.

[`applicative.ts`](../src/applicative.ts) retains its currying exercise. It first
turns a rest-parameter function into a function with one to six named
parameters, then curries it, lifts the function and arguments, and repeatedly
uses `ap`. Rest parameters do not contribute to JavaScript's `fn.length`;
the adapter is still necessary for this particular currying strategy.
Unsupported arities return an outer None. The existing dynamic currying code
still uses `any` and a final type assertion; this migration does not make that
exercise's arbitrary-arity application statically safe. The local HKT
interfaces themselves require neither escape hatch.

## Monoids and semigroups become reducers and combiners

The mathematical ideas remain useful. A semigroup combines two values
associatively. A monoid also supplies an identity value, such as `0` for
addition or `[]` for array concatenation. V4's `Combiner` and `Reducer` provide
the corresponding operational shapes. As with the local typeclasses, an
interface cannot prove the algebraic laws for an arbitrary implementation.

| V3 API used here | V4 API |
| --- | --- |
| `@effect/typeclass/Semigroup` | `effect/Combiner` |
| `@effect/typeclass/Monoid` | `effect/Reducer` |
| `MonoidSum`, `SemigroupSum` | `Number.ReducerSum` (also usable as a Combiner) |
| String `Monoid` | `String.ReducerConcat` |
| Array `getMonoid<A>()` | `Array.makeReducerConcat<A>()` |
| Monoid `empty` | Reducer `initialValue` |
| Ordering `combineAll` | `Ordering.Reducer.combineAll` |

For example, the old sum becomes:

```ts
// Historical v3 code.
import { MonoidSum } from "@effect/typeclass/data/Number";
MonoidSum.combineAll([1, 2, 3, 4]); // 10

// V4 code.
import { ReducerSum } from "effect/Number";
ReducerSum.combineAll([1, 2, 3, 4]); // 10
```

The array-flattening exercises still combine entire arrays rather than combine
their elements using addition or string concatenation. The native v4 array
reducer's signature accepts mutable inner arrays. The exercises keep their
readonly input types and copy each inner array with `Array.fromIterable` at
the boundary, then concatenate with the native reducer. The original input
arrays stay unchanged; the conversion allocates shallow copies.

The ordering exercise retains the same comparisons: length, vowel count, then
lexicographic order. `Ordering.Reducer` chooses the first nonzero comparison,
with `0` as identity. The comparison expressions are still constructed eagerly;
selecting the first nonzero value does not make the earlier array construction
lazy. Primitive Order instances are now `Order.Number` and `Order.String`,
with capital letters.

## Two meanings of combining Options

This distinction is essential to preserving the examples. Optional values can
mean either “a contribution that may be absent” or “an input required for the
whole calculation.” The two interpretations have different combining rules.

The optional-array example uses the first interpretation. Historically:

```ts
// Historical v3 code.
const arrays = getArrayMonoid<number>();
const optionalArrays = getOptionalMonoid(arrays);
optionalArrays.combineAll([Option.some([1, 2]), Option.none(), Option.some([3, 4])]);
// Some([1, 2, 3, 4])
```

The v4 equivalent is:

```ts
const arrays = Array.makeReducerConcat<number>();
const optionalArrays = Option.makeReducer(arrays);
optionalArrays.combineAll([Option.some([1, 2]), Option.none(), Option.some([3, 4])]);
// Some([1, 2, 3, 4])
```

The fold starts with None. Combining None with a Some keeps the Some; combining
two Somes concatenates their arrays. All absent inputs, including an empty
collection, produce None. A present empty array remains `Some([])`.

By contrast, [`optional-effect.ts`](../src/optional-effect.ts) lifts addition
into an applicative context, where both numeric inputs are required:

```ts
// Historical v3 code.
const optionSemigroup = SA.getSemigroup(O.SemiApplicative)(N.SemigroupSum);

// Current generic teaching version.
const optionSemigroup = SA.getCombiner(O.SemiApplicative)(N.ReducerSum);

// Native v4 equivalent when only Option is needed.
const optionCombiner = Option.makeCombinerFailFast(N.ReducerSum);
optionCombiner.combine(Option.some(2), Option.some(3)); // Some(5)
optionCombiner.combine(Option.some(2), Option.none());  // None
```

The generic version uses our `product`/`lift2` definitions, so the technique of
lifting a combining operation into any supplied applicative context remains
visible. The native equivalent is appropriate when there is no teaching need
to abstract over the container. Using `Option.makeReducer` here would change
the missing-input behaviour and would be an incorrect migration.

## Small changes and unchanged examples

`Option.fromNullable` becomes `Option.fromNullishOr` in the arity adapter.
`pipe` now comes from `effect/Function` everywhere; the obsolete standalone
`@effect/data` package is gone. V3-only names appear in these historical notes,
not in executable imports.

The concrete Option APIs used by Pierre and the do-notation example already
work in v4. Their flatMap chains, record-building notation, and generators are
retained. The standalone Option and curry examples also keep their behaviour.

Two comments in `applicative.ts` previously claimed that `2 + 4 + 6` produced
20. The observed v3 result was 12. The migration corrects those comments to
12; it does not change the calculation to match an incorrect expectation.

## Verification and observed results

Before changing the runtime dependencies, all twelve original scripts were
executed and every `console.log` argument was captured. After the migration,
all twelve were executed again and the captured values were compared with a
deep equality check. **All 70 logged calls matched**, allowing only the intended
Either/Right → Result/Success wrapper and heading changes. Option display
metadata was omitted for the comparison; arrays, payloads, strings, numbers,
record fields, absence tags, call order, and the other headings were retained.

The compact captures are saved as [v3 values](evidence/effect-v3-values.json)
and [v4 values](evidence/effect-v4-values.json). Their JSON represents arrays
of logged argument lists, keyed by script name. The v3 capture normalizes Right
to Success for comparison, but keeps the original Either heading; the current
capture uses the Result heading. These are migration evidence, not a new unit
test suite or a test runner dependency.

The following table uses `Some(...)`, `None`, and `Success(...)` as readable
notation for the actual printed wrapper objects. Headings are omitted here.

| Script | Observed values, in order |
| --- | --- |
| `applicative.ts` | `10`, `[10]`; `Some(8)` twice; `Some("FooBar")` twice; `[8]` twice; `[6]` twice; `Some(12)` twice; `Some(20)` twice; `Some("OneTwoThreeFour")` twice |
| `basic-custom-monad.ts` | `{ x: "4!" }`, `{ x: 42 }`, `{ x: "Second!" }`, `{ x: 8 }` |
| `better-functor-custom-type.ts` | `{ x: "4!" }`, `["2!", "4!", "6!"]` |
| `curry.ts` | `add2Result: 8`, `add3Result: 6`, `add4Result: 10` |
| `effect-do-notation.ts` | `Some("3!")` twice, `Some({ x: 2, y: 3, sum: 5 })` |
| `generic-monad.ts` | `Some(35)`, `Success(35)` (v3: `Right(35)`), `[35]` |
| `monoid-flatten-array.ts` | `[1, 2, 4, 5]`, `["foo", "bar", "baz"]` |
| `monoid-flatten-optional-array.ts` | `Some([1, 2, 3, 4])`, `Some(["foo", "bar", "baz"])`, `None` |
| `monoid-ordering.ts` | `-1`, `1`, `-1`, `-1`, `1` |
| `optional-effect.ts` | `Some(6)`, `[2, 3, 4, 5]`, `Some(10)`, `[2, 4, 6, 8]`, `None`, `Some(5)`, `None`, `Some(5)` |
| `optional-standalone.ts` | `Some(6)`, `None`, `Some(6)`, `Some(10)` |
| `pierre-monad.ts` | All six labelled results are `None` |

Pierre's first three results are supposed to fail with the committed inputs.
After landing left 1 and right 4, the pole is `(1, 4)`. Removing the left bird
would produce `(0, 4)`, which violates the strict difference `< 4`, so all three
sequencing styles return None. The other three explicitly encounter the banana
and stop. Changing right 4 to right 3 would make the non-banana sequence succeed;
that is a different input, not a migration fix.

Run the normal checks with:

```sh
npm ci
npm test
```

`npm test` now runs both `tsc --noEmit` and every example. The example runner
stops on the first failing process. It uses `node --import tsx`, which runs the
TypeScript files without the `tsx` CLI's auxiliary IPC socket. The file-local
Emacs commands and documented `npx tsx` commands remain usable normally.
The regular runner prints results for inspection against the table; it does
not automatically assert output equality. The complete v3/v4 comparison was
performed as part of this migration. No unit-test framework was added.

The final clean `npm ci` completed successfully, including the language-service
patch. `npm test` then passed both type checking and all twelve scripts, and a
fresh capture still matched the baseline and saved v4 evidence. `npm ls`
confirmed Effect 4.1.4 and language service 0.87.5 with no old data/typeclass
packages. The runtime dependency audit reported zero vulnerabilities, and
`git diff --check` passed.
