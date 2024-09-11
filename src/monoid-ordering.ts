// -*- compile-command: "npx ts-node monoid-ordering.ts" -*-

import { combineAll, Ordering } from "effect/Ordering"; // Importing combineAll for combining orderings
import * as Ord from "effect/Order"; // Importing all Order instances and utilities from Order module
import * as O from "@effect/typeclass/data/Ordering"; // Importing Ordering related Semigroup and Monoid

// lengthCompare :: String -> String -> Ordering
// lengthCompare x y = (length x `compare` length y) `mappend`
//                     (vowels x `compare` vowels y) `mappend`
//                     (x `compare` y)
//     where vowels = length . filter (`elem` "aeiou")

// Utility function to count vowels in a string
const countVowels = (s: string): number =>
  s.split('').filter(c => 'aeiou'.indexOf(c.toLowerCase()) !== -1).length;

// Order instance for comparing strings by their length
const ordLength = Ord.mapInput((s: string) => s.length)(Ord.number);

// Order instance for comparing strings by their number of vowels
const ordVowels = Ord.mapInput((s: string) => countVowels(s))(Ord.number);

// Order instance for lexicographic comparison of strings
const ordLexical = Ord.string;

// Combined comparison function using combineAll
const lengthCompare = (x: string, y: string): Ordering => 
  combineAll([
    ordLength(x, y),  // Compare by length
    ordVowels(x, y),  // Compare by number of vowels
    ordLexical(x, y)  // Compare lexicographically
  ]);

// Testing the lengthCompare function
console.log(lengthCompare('zen', 'ants')); // Expected output: -1 (LT)
console.log(lengthCompare('zen', 'ant'));  // Expected output: 1 (GT)
console.log(lengthCompare('zen', 'anna')); // Expected output: -1
console.log(lengthCompare('zen', 'ana'));  // Expected output: -1
console.log(lengthCompare('zen', 'ann'));  // Expected output: 1
