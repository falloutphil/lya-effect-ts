// This version works with no effect-ts code at all!
// It shows the mechanics from first principles and is based on fp-ts not effect-ts

// Define the None interface
interface None {
  readonly _tag: 'None';
}

// Define the Some interface
interface Some<A> {
  readonly _tag: 'Some';
  readonly value: A;
}

// Define the Option type as a union of None and Some
type Option<A> = None | Some<A>;

// Define constructors for Option
const none: Option<never> = { _tag: 'None' };

const some = <A>(value: A): Option<A> => ({
  _tag: 'Some',
  value,
});

// So far all we've done is
// data Option a = None | Some a

// Define the Functor interface using Higher-Kinded Types (HKTs)
interface Functor<F extends keyof URItoKind<any>> {
  readonly URI: F;
  readonly map: <A, B>(fa: URItoKind<A>[F], f: (a: A) => B) => URItoKind<B>[F];
}
//  class Functor f where
//    fmap :: (a -> b) -> f a -> f b


// Define the URItoKind interface to map URIs to their corresponding types
interface URItoKind<A> {
  Option: Option<A>;
  // Additional type constructors can be added here
}

// Helper constant to avoid repetition of 'Option'
const optionURI = 'Option' as const;

// Implement the Functor instance for Option
const optionFunctor: Functor<typeof optionURI> = {
  URI: optionURI, // Here, we use the constant to avoid repeating 'Option'
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> => {
    if (fa._tag === 'Some') {
      return some(f(fa.value)); // Apply the function if there's a value
    } else {
      return none; // Return None if the value is absent
    }
  }
};

//  instance Functor Option where
//    fmap f (Some x) = Some (f x)       -- If the Option is Some, apply the function f to the value inside.
//    fmap _ None = None                 -- If the Option is None, fmap does nothing.

    
// Example usage

const someValue: Option<number> = some(5);
const noneValue: Option<number> = none;

// someValue :: Option Int
// someValue = Some 5
// noneValue :: Option Int
// noneValue = None
//
// 
// TypeScript needs to know that `x` is a number
const incremented = optionFunctor.map(someValue, (x: number) => x + 1); // Option<number> -> Some(6)
const stillNone = optionFunctor.map(noneValue, (x: number) => x + 1);    // Option<number> -> None

function increment<F extends keyof URItoKind<any>>(functor: Functor<F>, fa: URItoKind<number>[F]): URItoKind<number>[F] {
  return functor.map(fa, x => x + 1);
}

const incrementedWithGeneric = increment(optionFunctor, someValue);

// incremented :: Option Int
// incremented = fmap (+1) someValue 
// stillNone :: Option Int
// stillNone = fmap (+1) noneValue

// But this can be called without having to pass in the functor Functor<F>
// i.e. without the Option Functor instance  in Haskell!
// increment :: Functor f => f Int -> f Int
// increment = fmap (+1)



console.log(incremented); // Output: { _tag: 'Some', value: 6 }
console.log(stillNone);   // Output: { _tag: 'None' }
console.log(incrementedWithGeneric); // Output: { _tag: 'Some', value: 6 }

// Generic function that works with any Functor
function lift<F extends keyof URItoKind<any>, A, B>(
  functor: Functor<F>, fa: URItoKind<A>[F], f: (a: A) => B
): URItoKind<B>[F] {
  return functor.map(fa, f);
}

// Same thing here we can write lift in typescript as a generic
// function but it must receive the functor instance eg Option, Array whatever
// as the first parameter - in haskell we just map the provided function over the
// provided functor whatever instance that might be
//  lift :: Functor f => f a -> (a -> b) -> f b
//  lift fa f = fmap f fa

// Example usage with Option
const liftedOption = lift(optionFunctor, someValue, (x: number) => x + 5);

console.log(liftedOption); // Output: { _tag: 'Some', value: 10 }

//  liftedOption :: Option Int   <---------- NOTE: the type type decalaration is NOT needed
//  liftedOption = lift someValue (+5)

// all we care is that f is a functor and the result of type (f Int) can be printed!
//  printLifted :: (Functor f, Show (f Int)) => f Int -> IO ()
//  printLifted x = print (lifted x)
