import { createContext, useContext } from "react";
import { SpringValue } from "@react-spring/web";

/*
  Check comment on `VerticalSizeInternalContext`
 */
export class DescendantHeightPxRegistry {
  protected seq: number = 0;

  protected readonly _registries: {
    key: string;
    value: DescendantHeightPxRegistry;
  }[] = [];

  constructor(public readonly heightPx: SpringValue<number>) {}

  registerRegistry(registry: DescendantHeightPxRegistry): string {
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
        return true;
      }
    }
    return false;
  }

  protected isDescendantAnimatingWithSelf(): boolean {
    if (this.heightPx.isAnimating) {
      return true;
    }

    for (const registry of this._registries) {
      if (registry.value.heightPx.isAnimating) {
        return true;
      }
    }

    return false;
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
  registry: DescendantHeightPxRegistry;
}

export const _VerticalSizeInternalContext = createContext<VerticalSizeInternalContext | null>(
  null
);

export const useVerticalSizeInternalContext = (): VerticalSizeInternalContext | null => {
  return useContext(_VerticalSizeInternalContext);
};
