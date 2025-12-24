export class Debouncer {
  static promise<ArgumentsType extends unknown[], ReturnType>(
    fn: (...args: ArgumentsType) => PromiseLike<ReturnType> | ReturnType
  ): (...args: ArgumentsType) => Promise<ReturnType> {
    let currentPromise: PromiseLike<ReturnType> | ReturnType | undefined;

    return async function (this: unknown, ...arguments_: ArgumentsType): Promise<ReturnType> {
      if (currentPromise) {
        return currentPromise;
      }

      try {
        currentPromise = fn.apply(this, arguments_);
        return await currentPromise;
      } finally {
        currentPromise = undefined;
      }
    };
  }
}
