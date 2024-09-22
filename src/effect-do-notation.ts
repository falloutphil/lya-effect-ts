// -*- compile-command: "npx ts-node effect-do-notation.ts" -*-

import { pipe } from "effect/Function";
import * as O from "effect/Option";

// Chaining monadic operations with flatMap
const foo = pipe(
  O.some(3),               // First Option: Just 3
  O.flatMap((x) =>
    pipe(
      O.some("!"),         // Second Option: Just "!"
      O.map((y) => `${x}${y}`) // Combine x and y into a string
    )
  )
);

console.log(foo); // Output: Some("3!")


const result = pipe(
  O.Do,
  O.bind("x", () => O.some(2)),
  O.bind("y", () => O.some(3)),
  O.let("sum", ({ x, y }) => x + y),
  O.filter(({ sum }) => sum > 4) // Filter if needed
)

console.log(result) // Output: Option.some({ x: 2, y: 3, sum: 5 })
