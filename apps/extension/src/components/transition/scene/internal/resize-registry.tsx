import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  DescendantRegistryBase,
  _VerticalSizeInternalContext,
} from "../../vertical-size/internal";

export class SceneDescendantRegistry extends DescendantRegistryBase {
  protected topSceneId: string;

  // value is scene id
  protected isDescendantAnimatingLastSceneId: string | null = null;

  constructor(topSceneId: string) {
    super();
    this.topSceneId = topSceneId;
  }

  setTopSceneId(topSceneId: string): void {
    if (this.topSceneId !== topSceneId) {
      this.topSceneId = topSceneId;
    }
  }

  override isDescendantAnimating(): boolean {
    for (const registry of this._registries) {
      if (
        registry.value instanceof SceneElementDescendantRegistry &&
        registry.value.sceneId === this.topSceneId &&
        registry.value.isDescendantAnimatingWithSelf()
      ) {
        this.isDescendantAnimatingLastSceneId = this.topSceneId;
        return true;
      }
    }
    if (this.isDescendantAnimatingLastSceneId != null) {
      if (this.isDescendantAnimatingLastSceneId === this.topSceneId) {
        // Check comments on `DescendantRegistryBase`.
        setTimeout(() => {
          this.isDescendantAnimatingLastSceneId = null;
        }, 1);
        return true;
      } else {
        this.isDescendantAnimatingLastSceneId = null;
      }
    }
    return false;
  }

  isAnimating(): boolean {
    // Noop
    return false;
  }
}

export class SceneElementDescendantRegistry extends DescendantRegistryBase {
  public sceneId: string;

  constructor(sceneId: string) {
    super();
    this.sceneId = sceneId;
  }

  setSceneId(sceneId: string): void {
    if (this.sceneId !== sceneId) {
      this.sceneId = sceneId;
    }
  }

  isAnimating(): boolean {
    // Noop
    return false;
  }
}

export const SceneDescendantRegistryWrap: FunctionComponent<
  PropsWithChildren<{
    parentRegistry: SceneDescendantRegistry;
    sceneId: string;
  }>
> = ({ sceneId, parentRegistry, children }) => {
  const [registry] = useState(
    () => new SceneElementDescendantRegistry(sceneId)
  );
  // XXX: Below method doesn't affect the state and only used to sync key if it is changed.
  registry.setSceneId(sceneId);

  useLayoutEffect(() => {
    const registryKey = parentRegistry.registerRegistry(registry);

    return () => {
      parentRegistry.unregisterRegistry(registryKey);
    };
  }, [parentRegistry, registry]);

  const contextValue = useMemo(() => {
    return {
      registry,
    };
  }, [registry]);

  return (
    <_VerticalSizeInternalContext.Provider value={contextValue}>
      {children}
    </_VerticalSizeInternalContext.Provider>
  );
};
