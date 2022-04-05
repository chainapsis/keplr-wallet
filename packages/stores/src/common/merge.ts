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
 * KR: `Base`부터 시작해서 다음 Inject에는 이전 Inject의 결과가 merge된 값이 파라미터에 전달된다.
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
 * KR: `Base`로부터 시작해서 Injects의 값들을 강제로 주입(?)한다. 실제 구현은 구리고 단순하다.
 *      단순히 이후의 object의 field들을 강제로 이전의 결과에 같은 key로 집어넣는다.
 *      즉, nested object나 deep object는 다루지 못 한다. 또한 `Base`로 전달된 값을 mutate한다.
 *      같은 key의 field가 이미 이전 결과에 존재한다면 오류를 던진다.
 *      @keplr-wallet/stores 패키지 내에서 필요로 하는 최소한의 기능만을 한다.
 *      최소한의 case만을 다룰 수 있기 때문에 어떤 함수인지 이해한 상태로만 사용하길 바람.
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
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i] as Functionify<any, any>;
    const r = fn(baseStore, ...parameters);

    for (const key of Object.keys(r)) {
      if (baseStore[key]) {
        throw new Error(`${key} is already merged`);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      baseStore[key] = r[key];
    }
  }

  return baseStore as any;
};
