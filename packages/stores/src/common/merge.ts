import { UnionToIntersection } from "utility-types";

export interface IObject {
  [key: string]: any;
  length?: never;
}

/**
 * Makes the function that accepts tuple `P` as parameter and return `R`.
 * This is not useful when used alone.
 * This is used to implement `TupleFunctionify` and `mergeStores`.
 *
 * Functionify<[number, string], number> = (n:number, s:string) => number
 */
export type Functionify<P extends Array<any>, R> = (...p: P) => R;
/**
 * Make the tuple of functions that accept tuple `P` as parameter and return `R` respectively.
 *
 * TupleFunctionify<[number, string], [number, string, number]> =
 *  [(n:number, s:string) => number, (n:number, s:string) => string, (n:number, s:string) => number]
 */
export type TupleFunctionify<
  P extends Array<any>,
  T extends Array<any>
> = T extends [infer Head, ...infer Tail]
  ? [Functionify<P, Head>, ...TupleFunctionify<P, Tail>]
  : [];

/**
 * The pattern of using one store with multiple sub stores is often used.
 * For example, `queries.cosmos, queries.cosmwasm` is used by putting sub-stores per module in the main store.
 * This is a function that handles this part in common way.
 * `merge` is only provided at a shallow level and can't handle properly for deep, nested objects.
 * Also, if the properties of objects overlap, it does not guarantee proper functioning.
 *
 * @param parameters Tuple to pass to fns as parameters.
 * @param fns The functions to create the merged object.
 */
export const mergeStores = <P extends Array<any>, T extends Array<IObject>>(
  parameters: P,
  ...fns: TupleFunctionify<P, T>
): UnionToIntersection<T[number]> => {
  let r = {};
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i] as Functionify<P, any>;
    r = Object.assign(r, fn(...parameters));
  }

  return r as UnionToIntersection<T[number]>;
};
