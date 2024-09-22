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

const foo2 = pipe(
  O.Do,
  O.bind("x", () => O.some(3)), // binds 3 to key x in our object
  O.bind("y", () => O.some('!')), // binds ! to key y in our object
  // Pipe passes to the map O.some({ x: 3, y: '!' })
  O.map(({x,y}) => `${x}${y}`) // mapping function destructs the object passed in { x: 3, y: '!' }
)

console.log(foo2)

// So O.bind takes a key name as string, a fn returning variable to store in string,
// and an object that we are to add the key value pair to (which is passed by pipe as last param)
const result = pipe(
  O.Do,
  O.bind("x", () => O.some(2)),
  O.bind("y", () => O.some(3)),
  O.let("sum", ({ x, y }) => x + y),
  O.filter(({ sum }) => sum > 4) // Filter if needed
)

console.log(result) // Output: Option.some({ x: 2, y: 3, sum: 5 })
