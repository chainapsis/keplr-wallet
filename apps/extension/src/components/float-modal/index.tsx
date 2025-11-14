import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useModalRoot } from "../modal/internal";
import ReactDOM from "react-dom";
import { animated, useSpringValue } from "@react-spring/web";
import Color from "color";
import { defaultSpringConfig } from "../../styles/spring";
import { ColorPalette } from "../../styles";
import { useTheme } from "styled-components";

type FloatModalProps = {
  isOpen: boolean;
  close: () => void;
  disableBackdrop?: boolean;
  disableBackdropStyle?: boolean;
};

// 해당 모달은 modal을 그대로 가져왔지만 float ui를 위해서 수정.
// backdrop 기능을 보존하고, align으로 인한 애니메이션 효과를 제거함.
// 현재 해당 컴포넌트의 기능은 오직 백드랍 기능과 백드랍 배경색 변경을 위해서 존재함.
// 따라서 실제 ui는 FloatModal의 children으로써 각 컴포넌트에서 직접 구현을 해야함.
export const FloatModal: FunctionComponent<
  PropsWithChildren<FloatModalProps>
> = ({ isOpen, close, disableBackdrop, disableBackdropStyle, children }) => {
  const modalRoot = useModalRoot(isOpen);

  const needRootElement = isOpen;
  const rootElementIdRef = useRef<string | null>(null);

  const transition = useSpringValue(isOpen ? 1 : 0, {
    config: defaultSpringConfig,
  });

  useLayoutEffect(() => {
    if (isOpen) {
      transition.start(1);
    } else {
      transition.start(0);
    }
  }, [transition, isOpen]);

  const rootElement = useMemo(() => {
    if (needRootElement) {
      if (!rootElementIdRef.current) {
        rootElementIdRef.current = modalRoot.registerRootElement();
      }
      return modalRoot.getRootElement(rootElementIdRef.current);
    } else {
      if (rootElementIdRef.current) {
        modalRoot.releaseRootElement(rootElementIdRef.current);
        rootElementIdRef.current = null;
      }
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needRootElement]);

  useEffect(() => {
    return () => {
      if (rootElementIdRef.current) {
        modalRoot.releaseRootElement(rootElementIdRef.current);
        rootElementIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rootElement) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div>
      <ModalChild
        transition={transition}
        isOpen={isOpen}
        close={close}
        disableBackdrop={disableBackdrop}
        disableBackdropStyle={disableBackdropStyle}
      >
        {children}
      </ModalChild>
    </div>,
    rootElement
  );
};

const ModalChild: FunctionComponent<
  PropsWithChildren<{
    transition: ReturnType<typeof useSpringValue<number>>;

    isOpen: boolean;
    close: () => void;

    disableBackdrop?: boolean;
    disableBackdropStyle?: boolean;
  }>
> = ({
  children,
  transition,
  isOpen,
  close,
  disableBackdrop,
  disableBackdropStyle,
}) => {
  const innerContainerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  return (
    <animated.div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,

        // root의 pointer events가 "none"으로 설정된다.
        // 하지만 backdrop 자체가 모든 화면을 채우기 때문에 여기서 pointer events를 로직에 따라 대체할 수 있다.
        // disableBackdrop 옵션에 따라서 선택한다.
        pointerEvents: disableBackdrop ? "none" : "auto",

        backgroundColor:
          disableBackdrop || disableBackdropStyle
            ? "rgba(0,0,0,0)"
            : transition.to((t) =>
                Color(
                  theme.mode === "light"
                    ? ColorPalette["gray-550"]
                    : ColorPalette["gray-700"]
                )
                  .alpha(t * (theme.mode === "light" ? 0.3 : 0.5))
                  .string()
              ),
      }}
      onClick={(e) => {
        e.preventDefault();

        if (disableBackdrop) {
          if (
            innerContainerRef.current &&
            innerContainerRef.current !== e.target &&
            innerContainerRef.current.contains(e.target as Node)
          ) {
            e.stopPropagation();
          }
          return;
        }

        e.stopPropagation();

        if (
          innerContainerRef.current &&
          innerContainerRef.current !== e.target &&
          innerContainerRef.current.contains(e.target as Node)
        ) {
          return;
        }

        if (isOpen) {
          close();
        }
      }}
    >
      <div ref={innerContainerRef}>{children}</div>
    </animated.div>
  );
};
