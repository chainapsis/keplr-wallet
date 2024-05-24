// Copied from the mobx-state-tree repository.
/**
 * @deprecated use `toGenerator` from @keplr-wallet/mobx-utils
 * @experimental
 * experimental api - might change on minor/patch releases
 *
 * Convert a promise to a generator yielding that promise
 * This is intended to allow for usage of `yield*` in async actions to
 * retain the promise return type.
 *
 * Example:
 * ```ts
 * function getDataAsync(input: string): Promise<number> { ... }
 *
 * const someModel.actions(self => ({
 *   someAction: flow(function*() {
 *     // value is typed as number
 *     const value = yield* toGenerator(getDataAsync("input value"));
 *     ...
 *   })
 * }))
 * ```
 */
export function* toGenerator<R>(p: Promise<R>) {
  return (yield p) as R;
}
