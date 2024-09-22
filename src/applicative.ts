// -*- compile-command: "npx ts-node applicative.ts" -*-

import * as O from "@effect/typeclass/data/Option";
import * as A from "@effect/typeclass/data/Array";
import * as SA from "@effect/typeclass/SemiApplicative";
import type { Applicative } from "@effect/typeclass/Applicative";
import type { TypeLambda, Kind } from "effect/HKT";
import * as Option from "effect/Option";
import {pipe} from "effect/Function";
import { Monoid as MonoidString } from "@effect/typeclass/data/String";
import { MonoidSum } from "@effect/typeclass/data/Number";
import { Monoid } from "@effect/typeclass/Monoid"; // Import the Monoid interface
// 
// Function to convert a variadic function into a fixed-arity function using explicit lambdas
// This is required before we can use curryN
// If the arity doesn't match any function, Option.fromNullable returns Option.none.
const handleVariadicFunction = <T>(
  fn: (...args: T[]) => T,
  arity: number
) =>
  Option.fromNullable([
    (a: T) => fn(a),
    (a: T, b: T) => fn(a, b),
    (a: T, b: T, c: T) => fn(a, b, c),
    (a: T, b: T, c: T, d: T) => fn(a, b, c, d),
    (a: T, b: T, c: T, d: T, e: T) => fn(a, b, c, d, e),
    (a: T, b: T, c: T, d: T, e: T, f: T) => fn(a, b, c, d, e, f)
  ][arity - 1]);

// The `curryN` function: It takes a function and the arity of that function as parameters
// NOTE: it won't work on variadic function using "rest" parameters because they are represented
// as a single T[] parameter not T, T, T...
// This is why we have handleVariadicFunction to solve this!
const curryN = <T extends any[], R>
  (fn: (...args: T) => R) => {
    const curried = (...args: any[]): any =>
      // args provided to curried function equal or more than fn we curried?
      args.length >= fn.length 
      ? fn(...(args as T)) // then just call the fn
      // else return a new curried function requesting moreArgs and combining them with args
      // at each call a new nested function is returned to the client
      // which when called with more arguments the value of curried's args will increase
      // and another function will be returned, until all args are exhausted
      : (...moreArgs: any[]) => curried(...[...args, ...moreArgs]);
  return curried;
};

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
const applyFn = <F extends TypeLambda, T>(
  A: Applicative<F>,
  fn: (...args: T[]) => T,
  ...args: T[]
) =>
  pipe(
    handleVariadicFunction(fn, args.length),
    Option.map(curryN),
    Option.map(applyCurriedFunction(A)(args))
  );


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

// Allows us to use combineAll to be curried and have each parameter
// lifted into context.
// While simply running combineAll on the args achieves the same end result (if we lift the end result),
// it does not demonstrate the step-by-step propagation of context (like optionality, failures, or
// asynchronous behavior) that applicatives are designed to handle, and thus, conceptually and practically,
// they are not identical in the context of demonstrating applicative behavior.
// So think of this as a demonstration of how we can weave monoidal properties into an applicative context!
const monoid_spread = <T>
  (monoid: Monoid<T>) =>
  (...args: T[]) => {
  return monoid.combineAll(args);
}


console.log("----- Trivial Monoids  -----"); 

// Trivial example without applicative context
const numberSumResult = monoid_spread(MonoidSum)(1, 2, 3, 4); // Expected: 10
console.log(numberSumResult);

// Same procedure lifted into applicative context
const resultMonoid = applyFn(A.Applicative, monoid_spread(MonoidSum), 1, 2, 3, 4);
console.log(Option.getOrNull(resultMonoid));

console.log("----- Option Add -----");

const resultOption = applyFn(O.Applicative, add, 3, 5);
console.log(Option.getOrNull(resultOption)); // Expected: some(8)

const resultOptionMonoid = applyFn(O.Applicative, monoid_spread(MonoidSum), 3, 5);
console.log(Option.getOrNull(resultOptionMonoid)); // Expected: some(8)

console.log("----- Option Concat -----");

const resultOption2 = applyFn(O.Applicative, concat, 'Foo', 'Bar');
console.log(Option.getOrNull(resultOption2)); // Expected: some("FooBar")

const resultOption2Monoid = applyFn(O.Applicative, monoid_spread(MonoidString), 'Foo', 'Bar');
console.log(Option.getOrNull(resultOption2Monoid)); // Expected: some("FooBar")

console.log("----- Array Add 2 -----");

const resultArray = applyFn(A.Applicative, add, 3, 5);
console.log(Option.getOrNull(resultArray)); // Expected: [8]

const resultArrayMonoid = applyFn(A.Applicative, monoid_spread(MonoidSum), 3, 5);
console.log(Option.getOrNull(resultArrayMonoid)); // Expected: some(8)

console.log("----- Array Add 3 -----");

const resultArray3 = applyFn(A.Applicative, add_spread, 1, 2, 3);
console.log(Option.getOrNull(resultArray3)); // Expected: [6]

const resultArray3Monoid = applyFn(A.Applicative, monoid_spread(MonoidSum), 1, 2, 3);
console.log(Option.getOrNull(resultArray3Monoid)); // Expected: [6]

console.log("----- Option Add 3 -----");

const resultOption3 = applyFn(O.Applicative, add3, 2, 4, 6);
console.log(Option.getOrNull(resultOption3)); // Expected some(20)

const resultOption3Monoid = applyFn(O.Applicative, monoid_spread(MonoidSum), 2, 4, 6);
console.log(Option.getOrNull(resultOption3Monoid)); // Expected some(20)

console.log("----- Option Add 4 -----");

const resultOption4 = applyFn(O.Applicative, add_spread, 2, 4, 6, 8);
console.log(Option.getOrNull(resultOption4)); // Expected some(20)

const resultOption4Monoid = applyFn(O.Applicative, monoid_spread(MonoidSum), 2, 4, 6, 8);
console.log(Option.getOrNull(resultOption4Monoid)); // Expected some(20)

console.log("----- Option Concat 4 -----");

const resultOption5 = applyFn(O.Applicative, concat_spread, "One", "Two", "Three", "Four");
console.log(Option.getOrNull(resultOption5)); // Expected some(OneTwoThreeFour)

const resultOption5Option = applyFn(O.Applicative, monoid_spread(MonoidString), "One", "Two", "Three", "Four");
console.log(Option.getOrNull(resultOption5Option)); // Expected some(OneTwoThreeFour)
