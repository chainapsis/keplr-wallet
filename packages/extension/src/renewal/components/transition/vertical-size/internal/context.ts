import { createContext, useContext } from "react";
import { SpringValue } from "@react-spring/web";

export class DescendantHeightPxRegistry {
  protected seq: number = 0;

  protected readonly _descendantsHeightPx: {
    key: string;
    value: SpringValue<number>;
  }[] = [];

  protected readonly _descendantsRegistry: {
    key: string;
    value: DescendantHeightPxRegistry;
  }[] = [];

  registerHeightPx(heightPx: SpringValue<number>): string {
    this.seq++;

    const key = this.seq.toString();
    this._descendantsHeightPx.push({
      key,
      value: heightPx,
    });

    return key;
  }

  unregisterHeightPx(key: string): void {
    const i = this._descendantsHeightPx.findIndex((d) => d.key === key);
    if (i >= 0) {
      this._descendantsHeightPx.splice(i, 1);
    }
  }

  descendantsHeightPx(): SpringValue<number>[] {
    return this._descendantsHeightPx.map((d) => d.value);
  }

  registerRegistry(registry: DescendantHeightPxRegistry): string {
    this.seq++;

    const key = this.seq.toString();
    this._descendantsRegistry.push({
      key,
      value: registry,
    });

    return key;
  }

  unregisterRegistry(key: string): void {
    const i = this._descendantsRegistry.findIndex((d) => d.key === key);
    if (i >= 0) {
      this._descendantsRegistry.splice(i, 1);
    }
  }

  descendantsRegistry(): DescendantHeightPxRegistry[] {
    return this._descendantsRegistry.map((d) => d.value);
  }
}

export interface VerticalSizeInternalContext {
  registry: DescendantHeightPxRegistry;
}

export const _VerticalSizeInternalContext = createContext<VerticalSizeInternalContext | null>(
  null
);

export const useVerticalSizeInternalContext = (): VerticalSizeInternalContext | null => {
  return useContext(_VerticalSizeInternalContext);
};
