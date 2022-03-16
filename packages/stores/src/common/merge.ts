import { UnionToIntersection } from "utility-types";

export interface IObject {
  [key: string]: any;
  length?: never;
}

/**
 * Makes the function that accepts tuple `Params` as parameter and return `Return`.
 * This is not useful when used alone.
 * This is used to implement `TupleFunctionify` and `mergeStores`.
 *
 * Functionify<[number, string], number> = (n:number, s:string) => number
 */
export type Functionify<Params extends Array<any>, Return> = (
  ...p: Params
) => Return;
/**
 * Make the tuple of functions that accept `Base` tuple `Params` as parameter and return `Injects` respectively.
 * The passed `Base` parameter is merged from `Base` by chaining.
 *
 * ChainedFunctionifyTuple<{base: boolean}, [number, string], [{test1: number}, {test2: number}, {test3: string}]> =
 *  [
 *      ({base: boolean}, n:number, s:string) => {test1: number},
 *      ({base: boolean, test1: number}, n:number, s:string) => {test2: number},
 *      ({base: boolean, test1: number, test2: number}, n:number, s:string) => {test3: string}
 *  ]
 *
 * AFAIK, `variadic tuple types` and `recursive conditional types` features are introduced in typescript 4,
 * thus, this only works on typescript 4+.
 */
export type ChainedFunctionifyTuple<
  Base extends IObject,
  Params extends Array<any>,
  Injects extends Array<any>
> = Injects extends [infer Head, ...infer Tail]
  ? [
      Functionify<[Base, ...Params], Head>,
      ...ChainedFunctionifyTuple<Base & Head, Params, Tail>
    ]
  : [];

/**
 * The pattern of using one store with multiple sub stores is often used.
 * For example, `queries.cosmos, queries.cosmwasm` is used by putting sub-stores per module in the main store.
 * This is a function that handles this part in common way.
 * `merge` is only provided at a shallow level and can't handle properly for deep, nested objects.
 * Also, if the properties of objects overlap, it does not guarantee proper functioning.
 *
 * AFAIK, `variadic tuple types` and `recursive conditional types` features are introduced in typescript 4,
 * thus, this only works on typescript 4+.
 *
 * @param baseStore The base store on top.
 * @param parameters Tuple to pass to fns as parameters.
 * @param fns The functions to create the merged object.
 */
export const mergeStores = <
  Base extends IObject,
  Params extends Array<any>,
  Injects extends Array<IObject>,
  Return = Base & UnionToIntersection<Injects[number]>
>(
  baseStore: Base,
  parameters: Params,
  ...fns: ChainedFunctionifyTuple<Base, Params, Injects>
): Return => {
  let r = Object.assign({}, baseStore);
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i] as Functionify<any, any>;
    r = Object.assign(r, fn(r, ...parameters));
  }

  return r as any;
};
