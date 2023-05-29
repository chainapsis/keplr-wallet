import { createContext, useContext } from "react";
import { SpringValue } from "@react-spring/web";

/*
  Check comment on `VerticalSizeInternalContext`
 */
export interface IDescendantRegistry {
  registerRegistry(registry: IDescendantRegistry): string;
  unregisterRegistry(key: string): void;
  isDescendantAnimatingWithSelf(): boolean;
  isAnimating(): boolean;

  // XXX: 얘가 실제 `VerticalResizeTransition` component에서 animation을 skip할지 말지를 결정함.
  isDescendantAnimating(): boolean;
}

export abstract class DescendantRegistryBase implements IDescendantRegistry {
  protected seq: number = 0;

  protected readonly _registries: {
    key: string;
    value: IDescendantRegistry;
  }[] = [];

  protected isDescendantAnimatingLast: true | null = null;

  registerRegistry(registry: IDescendantRegistry): string {
    this.seq++;

    const key = this.seq.toString();
    this._registries.push({
      key,
      value: registry,
    });

    return key;
  }

  unregisterRegistry(key: string): void {
    const i = this._registries.findIndex((d) => d.key === key);
    if (i >= 0) {
      this._registries.splice(i, 1);
    }
  }

  isDescendantAnimating(): boolean {
    for (const registry of this._registries) {
      if (registry.value.isDescendantAnimatingWithSelf()) {
        this.isDescendantAnimatingLast = true;
        return true;
      }
    }
    // For skipping transition when child vertical resize transition is in progress,
    // we can use registry and internal context.
    // However, the problem is that at the time when child transition ends, the last resizing occurs
    // and below callback is called with child transition ends (not in progress), and it makes last resize execute animation.
    // To prevent this problem, we should defer `isDescendantAnimating()` to next frame.
    if (
      this.isDescendantAnimatingLast != null &&
      this.isDescendantAnimatingLast
    ) {
      setTimeout(() => {
        this.isDescendantAnimatingLast = null;
      }, 1);
      return true;
    }
    return false;
  }

  isDescendantAnimatingWithSelf(): boolean {
    if (this.isAnimating()) {
      return true;
    }

    for (const registry of this._registries) {
      if (registry.value.isAnimating()) {
        return true;
      }
    }

    return false;
  }

  abstract isAnimating(): boolean;
}

/*
  Check comment on `VerticalSizeInternalContext`
 */
export class DescendantHeightPxRegistry extends DescendantRegistryBase {
  public readonly heightPx: SpringValue<number>;

  constructor(heightPx: SpringValue<number>) {
    super();
    this.heightPx = heightPx;
  }

  isAnimating(): boolean {
    return this.heightPx.isAnimating;
  }
}

/*
  If vertical resize transition is nested, it is hard to handle transition well if child component's transition occurs.
  So, to reduce this problem, parent component's size is not animating if child component's transition is in progress.
  Thus, we need to share some values between parent and children.
  `registry` in context is handled as reference and should be persistent during component's lifecycle.
  Thus, should not be used for state, effect...

  However, above method is not sufficient if multiple transitions occur at the same time.
  Recommend not to use nested vertical transition.
 */
export interface VerticalSizeInternalContext {
  registry: IDescendantRegistry;
}

export const _VerticalSizeInternalContext =
  createContext<VerticalSizeInternalContext | null>(null);

export const useVerticalSizeInternalContext =
  (): VerticalSizeInternalContext | null => {
    return useContext(_VerticalSizeInternalContext);
  };
