// -*- compile-command: "npx ts-node applicative.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Applicative } from "@effect/typeclass/Applicative";
import type { TypeLambda, Kind } from "effect/HKT";
import * as Option from "effect/Option";
import {pipe} from "effect/Function";

import { Monoid as StringMonoid } from "@effect/typeclass/data/String";
import { MonoidSum, MonoidMultiply } from "@effect/typeclass/data/Number";
import { Monoid } from "@effect/typeclass/Monoid"; // Import the Monoid interface
// 
// Function to convert a variadic function into a fixed-arity function using explicit lambdas
// This is required before we can use curryN
function handleVariadicFunction<T>(
  fn: (...args: T[]) => T,
  arity: number
) {
  // Return a function with a fixed number of parameters based on arity
 switch (arity) {
    case 1:
      return Option.some((a: T) => fn(a));
    case 2:
      return Option.some((a: T, b: T) => fn(a, b));
    case 3:
      return Option.some((a: T, b: T, c: T) => fn(a, b, c));
    case 4:
      return Option.some((a: T, b: T, c: T, d: T) => fn(a, b, c, d));
    case 5:
      return Option.some((a: T, b: T, c: T, d: T, e: T) => fn(a, b, c, d, e));
    case 6:
      return Option.some((a: T, b: T, c: T, d: T, e: T, f: T) => fn(a, b, c, d, e, f));
    // Extend further if needed
    default:
     return Option.none(); // Return None if the arity is not supported
  }
}


// The `curryN` function: It takes a function and the arity of that function as parameters
// NOTE: it won't work on variadic function using "rest" parameters because they are represented
// as a single T[] parameter not T, T, T...
// This is why we have handleVariadicFunction to solve this!
function curryN<T extends any[], R>(fn: (...args: T) => R) {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args as T);
    } else {
      return (...moreArgs: any[]) => curried(...[...args, ...moreArgs]);
    }
  };
}

// Function to apply arguments using reduce in a curried and pipe-friendly way
// with the curried function passed from the previous pipe function being
// the last (curried) parameter.
const applyCurriedFunction = <F extends TypeLambda, T>
  (A: Applicative<F>) =>
  (args: T[]) =>
  (curriedFn: (arg: T) => any) => {
      const ap = SA.ap(A);
      const of = A.of;

      // Lift the curried function into the applicative context
      // Apply each lifted argument step by step
      // Help compiler by casting the final fully applied HKT to
      // be of return type T (each acc will apply one lifted arg
      // which produces a new acc with on less curried parameter)
      return args.reduce(
        (acc, arg) => ap(of(arg))(acc),
        of(curriedFn)
      ) as Kind<F, unknown, never, never, T>;
    };


// Function to lift and apply a curried function
// to lifted arguments, in the applicative context
function applyFn<F extends TypeLambda, T>(
  A: Applicative<F>,
  fn: (...args: T[]) => T, // Variadic function
  ...args: T[]             // Expect a variadic list of arguments
) {
  return pipe (
    handleVariadicFunction(fn, args.length),
    Option.map(curryN),
    Option.map(applyCurriedFunction(A)(args))
  )
}

// Test cases with Option and Array applicatives
// ---------------------------------------------

// Define the addition and concatenation functions
const add = (x: number, y: number): number => x + y;
const add3 = (x: number, y: number, z: number): number => x + y + z;
// Test with variadic add_spread function
const add_spread = (...args: number[]): number => args.reduce((acc, val) => acc + val, 0);
// Test with strings
const concat = (x: string, y: string): string => x + y;
// TODO: You can use a generic MONOID to define this using empty for string and int!
const concat_spread = (...args: string[]): string => args.reduce((acc, val) => acc + val, "");

const monoid_spread = <T>
  (monoid: Monoid<T>) =>
  (...args: T[]) => {
  return monoid.combineAll(args);
}

const numberSumResult = monoid_spread(MonoidSum)(1, 2, 3, 4); // Expected: 10
console.log(numberSumResult);

const resultMonoid = applyFn(A.Applicative, monoid_spread(MonoidSum), 1, 2, 3, 4);
console.log(Option.getOrNull(resultMonoid));

const resultOption = applyFn(O.Applicative, add, 3, 5);
console.log(Option.getOrNull(resultOption)); // Expected: some(8)

const resultOption2 = applyFn(O.Applicative, concat, 'Foo', 'Bar');
console.log(Option.getOrNull(resultOption2)); // Expected: some("FooBar")

const resultArray = applyFn(A.Applicative, add, 3, 5);
console.log(Option.getOrNull(resultArray)); // Expected: [8]

const resultArray3 = applyFn(A.Applicative, add_spread, 1, 2, 3);
console.log(Option.getOrNull(resultArray3)); // Expected: [6]

const resultOption3 = applyFn(O.Applicative, add3, 2, 4, 6);
console.log(Option.getOrNull(resultOption3)); // Expected some(20)

const resultOption4 = applyFn(O.Applicative, add_spread, 2, 4, 6, 8);
console.log(Option.getOrNull(resultOption4)); // Expected some(20)

const resultOption5 = applyFn(O.Applicative, concat_spread, "One", "Two", "Three", "Four");
console.log(Option.getOrNull(resultOption5)); // Expected some(OneTwoThreeFour)
