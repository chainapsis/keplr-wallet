import React, {
  FunctionComponent,
  useEffect,
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
  useVerticalSizeInternalContext,
} from "./internal";

export const VerticalResizeTransition: FunctionComponent<VerticalResizeTransitionProps> = ({
  children,
  width,
  transitionAlign,
  springConfig,
}) => {
  // if -1, it means not initialized yet.
  const heightPx = useSpringValue<number>(-1, {
    config: springConfig,
  });

  const [registry] = useState(() => new DescendantHeightPxRegistry(heightPx));
  const internalContext = useVerticalSizeInternalContext();

  useEffect(() => {
    if (internalContext) {
      const registryKey = internalContext.registry.registerRegistry(registry);

      return () => {
        internalContext.registry.unregisterRegistry(registryKey);
      };
    }
  }, [internalContext, registry]);

  const initialized = useRef(false);
  // For skipping transition when child vertical resize transition is in progress,
  // we can use registry and internal context.
  // However, the problem is that at the time when child transition ends, the last resizing occurs
  // and below callback is called with child transition ends (not in progress), and it makes last resize execute animation.
  // To prevent this problem, we should defer `isDescendantAnimating()` to next frame.
  const isDescendantAnimatingLast = useRef<boolean | null>(null);
  const ref = useVerticalResizeObserver((height: number) => {
    if (!initialized.current) {
      // At first, set height without animation.
      heightPx.set(height);
      initialized.current = true;
      return;
    }

    const isDescendantAnimating = (() => {
      if (registry.isDescendantAnimating()) {
        isDescendantAnimatingLast.current = true;
        return true;
      }

      if (
        isDescendantAnimatingLast.current != null &&
        isDescendantAnimatingLast.current
      ) {
        setTimeout(() => {
          isDescendantAnimatingLast.current = null;
        }, 1);
        return true;
      }
      return false;
    })();

    if (!isDescendantAnimating) {
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
    >
      <_VerticalSizeInternalContext.Provider value={contextValue}>
        {children}
      </_VerticalSizeInternalContext.Provider>
    </VerticalResizeContainer>
  );
};
