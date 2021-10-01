export class Debouncer {
  static promise<ArgumentsType extends unknown[], ReturnType>(
    fn: (...args: ArgumentsType) => PromiseLike<ReturnType> | ReturnType
  ): (...args: ArgumentsType) => Promise<ReturnType> {
    let currentPromise: PromiseLike<ReturnType> | ReturnType | undefined;

    return async (...arguments_) => {
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
