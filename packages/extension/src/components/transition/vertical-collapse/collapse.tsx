import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VerticalCollapseTransitionProps } from "./types";
import {
  useVerticalResizeObserver,
  VerticalResizeContainer,
} from "../internal";
import { animated, useSpringValue } from "@react-spring/web";
import {
  DescendantHeightPxRegistry,
  IDescendantRegistry,
  useVerticalSizeInternalContext,
  _VerticalSizeInternalContext,
} from "../vertical-size/internal";
import { defaultSpringConfig } from "../../../styles/spring";

export const VerticalCollapseTransition: FunctionComponent<
  VerticalCollapseTransitionProps
> = ({ children, collapsed, width, transitionAlign }) => {
  const heightPx = useSpringValue(collapsed ? 0 : -1, {
    config: defaultSpringConfig,
  });

  const [registry] = useState<IDescendantRegistry>(
    () => new DescendantHeightPxRegistry(heightPx)
  );
  const internalContext = useVerticalSizeInternalContext();

  useLayoutEffect(() => {
    if (internalContext) {
      const registryKey = internalContext.registry.registerRegistry(registry);

      return () => {
        internalContext.registry.unregisterRegistry(registryKey);
      };
    }
  }, [internalContext, registry]);

  const lastHeight = useRef(collapsed ? 0 : -1);
  const ref = useVerticalResizeObserver((height: number) => {
    lastHeight.current = height;
    if (!collapsed) {
      heightPx.set(height);
    }
  });

  const opacity = useSpringValue(collapsed ? 0.1 : 1, {
    config: defaultSpringConfig,
  });

  useEffect(() => {
    if (collapsed) {
      heightPx.start(0);
      opacity.start(0.1);
    } else {
      heightPx.start(lastHeight.current);
      opacity.start(1);
    }
  }, [collapsed, heightPx, opacity]);

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
        <animated.div
          style={{
            opacity,
          }}
        >
          {children}
        </animated.div>
      </_VerticalSizeInternalContext.Provider>
    </VerticalResizeContainer>
  );
};
