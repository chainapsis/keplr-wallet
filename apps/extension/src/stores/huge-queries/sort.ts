import {
  action,
  makeObservable,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
} from "mobx";

// 대충 만들었으니 꼭 필요하지 않으면 쓰지 말 것...
// NOTE: T는 무조건 object여야하고 어떤 클래스의 instance면 안된다.
export class BinarySortArray<T> {
  static readonly SymbolKey = Symbol("__key");

  @observable.ref
  protected _arr: (T & {
    [BinarySortArray.SymbolKey]: string;
  })[] = [];
  protected readonly indexForKey = new Map<string, number>();
  protected readonly compareFn: (a: T, b: T) => number;

  constructor(
    compareFn: (a: T, b: T) => number,
    onObserved: () => void,
    onUnobserved: () => void
  ) {
    this.compareFn = compareFn;

    makeObservable(this);

    let i = 0;
    onBecomeObserved(this, "_arr", () => {
      i++;
      if (i === 1) {
        onObserved();
      }
    });
    onBecomeUnobserved(this, "_arr", () => {
      i--;
      if (i === 0) {
        onUnobserved();
      }
    });
  }

  @action
  pushAndSort(key: string, value: T): boolean {
    const prevIndex = this.indexForKey.get(key);

    const v = {
      ...value,
      [BinarySortArray.SymbolKey]: key,
    };

    if (this._arr.length === 0) {
      this._arr.push(v);
      this.indexForKey.set(key, 0);
      // Update reference
      this._arr = this._arr.slice();
      return false;
    }

    if (prevIndex != null && prevIndex >= 0) {
      // 이미 존재했을때
      // 위치를 수정할 필요가 없으면 값만 바꾼다.
      let b = false;
      if (prevIndex > 0) {
        const prev = this._arr[prevIndex - 1];
        b = this.compareFn(prev, value) <= 0;
      }
      if (b || prevIndex === 0) {
        if (prevIndex < this._arr.length - 1) {
          const next = this._arr[prevIndex + 1];
          b = this.compareFn(value, next) <= 0;
        }
      }

      if (b) {
        this._arr[prevIndex] = v;
        // Update reference
        this._arr = this._arr.slice();
        return true;
      }
    }

    // Do binary insertion sort
    let left = 0;
    let right = this._arr.length - 1;
    let mid = 0;
    while (left <= right) {
      mid = Math.floor((left + right) / 2);
      const el = this._arr[mid];
      const compareRes = this.compareFn(el, value);
      if (compareRes === 0) {
        if (prevIndex != null && prevIndex >= 0) {
          const elKey = el[BinarySortArray.SymbolKey];
          const elIndex = this.indexForKey.get(elKey)!;
          const compareIndexRes = prevIndex - elIndex;
          if (compareIndexRes < 0) {
            left = mid + 1;
          } else if (compareIndexRes > 0) {
            right = mid - 1;
          } else {
            // Can't be happened
            break;
          }
        } else {
          left = mid + 1;
        }
      } else if (compareRes < 0) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (right < 0) {
      mid = Math.floor((left + right) / 2);
    } else {
      mid = Math.ceil((left + right) / 2);
    }
    if (mid < 0) {
      for (let i = 0; i < this._arr.length; i++) {
        if (prevIndex != null && prevIndex <= i) {
          break;
        }
        this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i + 1);
      }
      if (prevIndex != null && prevIndex >= 0) {
        this._arr.splice(prevIndex, 1);
      }
      this._arr.unshift(v);
      // Update reference
      this._arr = this._arr.slice();
      this.indexForKey.set(key, 0);
    } else if (mid >= this._arr.length) {
      if (prevIndex != null) {
        for (let i = prevIndex + 1; i < this._arr.length; i++) {
          this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i - 1);
        }
      }
      if (prevIndex != null && prevIndex >= 0) {
        this._arr.splice(prevIndex, 1);
      }
      this._arr.push(v);
      // Update reference
      this._arr = this._arr.slice();
      this.indexForKey.set(key, this._arr.length - 1);
    } else {
      if (prevIndex != null && prevIndex >= 0) {
        if (prevIndex < mid) {
          for (let i = prevIndex + 1; i < mid; i++) {
            this.indexForKey.set(
              this._arr[i][BinarySortArray.SymbolKey],
              i - 1
            );
          }
        } else {
          for (let i = mid; i < prevIndex; i++) {
            this.indexForKey.set(
              this._arr[i][BinarySortArray.SymbolKey],
              i + 1
            );
          }
        }
      } else {
        for (let i = mid; i < this._arr.length; i++) {
          this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i + 1);
        }
      }
      if (prevIndex != null && prevIndex >= 0) {
        if (prevIndex < mid) {
          this._arr.splice(mid, 0, v);
          this._arr.splice(prevIndex, 1);
          // prev가 삭제되었으므로 이 이후에 실제 설정되어야할 index는 mid - 1이다.
          mid = mid - 1;
        } else if (prevIndex > mid) {
          this._arr.splice(prevIndex, 1);
          this._arr.splice(mid, 0, v);
        } else {
          this._arr[prevIndex] = v;
        }
      } else {
        this._arr.splice(mid, 0, v);
      }
      // Update reference
      this._arr = this._arr.slice();
      this.indexForKey.set(key, mid);
    }

    // 이미 존재했으면(sort이면) true, 새롭게 추가되었으면(pushAndSort이면) false
    return prevIndex != null && prevIndex >= 0;
  }

  @action
  remove(key: string) {
    const index = this.indexForKey.get(key);
    if (index != null && index >= 0) {
      this.indexForKey.delete(key);
      for (let i = index + 1; i < this._arr.length; i++) {
        this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i - 1);
      }
      this._arr.splice(index, 1);
      // Update reference
      this._arr = this._arr.slice();
      return true;
    }
    return false;
  }

  indexForKeyMap(): ReadonlyMap<string, number> {
    return this.indexForKey;
  }

  indexOf(key: string): number {
    const index = this.indexForKey.get(key);
    if (index == null || index < 0) {
      return -1;
    }
    return index;
  }

  get arr(): ReadonlyArray<
    T & {
      [BinarySortArray.SymbolKey]: string;
    }
  > {
    return this._arr;
  }

  get(key: string): T | null {
    const index = this.indexForKey.get(key);
    if (index == null || index < 0) {
      return null;
    }
    return this._arr[index];
  }
}
