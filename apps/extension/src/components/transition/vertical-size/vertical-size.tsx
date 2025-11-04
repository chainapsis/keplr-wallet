import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSpringValue } from "@react-spring/web";
import { VerticalResizeTransitionProps } from "./types";
import {
  useVerticalResizeObserver,
  VerticalResizeContainer,
} from "../internal";
import {
  _VerticalSizeInternalContext,
  DescendantHeightPxRegistry,
  IDescendantRegistry,
  useVerticalSizeInternalContext,
} from "./internal";
import { defaultSpringConfig } from "../../../styles/spring";

export const VerticalResizeTransition: FunctionComponent<
  PropsWithChildren<VerticalResizeTransitionProps>
> = ({
  children,
  width,
  transitionAlign,
  registry: altRegistry,
  borderRadius,
}) => {
  // if -1, it means not initialized yet.
  const heightPx = useSpringValue<number>(-1, {
    config: defaultSpringConfig,
  });

  const [_registry] = useState<IDescendantRegistry>(
    () => new DescendantHeightPxRegistry(heightPx)
  );
  const registry = altRegistry ?? _registry;
  const internalContext = useVerticalSizeInternalContext();

  useLayoutEffect(() => {
    if (internalContext) {
      const registryKey = internalContext.registry.registerRegistry(registry);

      return () => {
        internalContext.registry.unregisterRegistry(registryKey);
      };
    }
  }, [internalContext, registry]);

  const initialized = useRef(false);
  const ref = useVerticalResizeObserver((height: number) => {
    if (!initialized.current) {
      // At first, set height without animation.
      heightPx.set(height);
      initialized.current = true;
      return;
    }

    if (!registry.isDescendantAnimating()) {
      heightPx.start(height);
    } else {
      heightPx.set(height);
    }
  });

  const contextValue = useMemo(() => {
    return {
      registry,
    };
  }, [registry]);

  return (
    <VerticalResizeContainer
      ref={ref}
      heightPx={heightPx}
      width={width}
      transitionAlign={transitionAlign}
      borderRadius={borderRadius}
    >
      <_VerticalSizeInternalContext.Provider value={contextValue}>
        {children}
      </_VerticalSizeInternalContext.Provider>
    </VerticalResizeContainer>
  );
};
