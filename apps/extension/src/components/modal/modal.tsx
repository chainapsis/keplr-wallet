import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useModalRoot } from "./internal";
import ReactDOM from "react-dom";
import { animated, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { ModalProps } from "./types";
import Color from "color";
import SimpleBar from "simplebar-react";
import { ColorPalette } from "../../styles";

const AnimatedSimpleBar = animated(SimpleBar);

export const Modal: FunctionComponent<PropsWithChildren<ModalProps>> = ({
  isOpen,
  close,
  align,
  maxHeight,
  onCloseTransitionEnd,
  forceNotUseSimplebar,
  forceNotOverflowAuto,
  disableBackdrop,
  children,
}) => {
  const modalRoot = useModalRoot(isOpen);

  // For transition during close.
  const [forceNotDetach, setForceNotDetach] = useState(isOpen);

  useLayoutEffect(() => {
    if (isOpen) {
      setForceNotDetach(true);
    }
  }, [isOpen]);

  const needRootElement = isOpen || forceNotDetach;
  const rootElementIdRef = useRef<string | null>(null);
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

  const transition = useSpringValue(isOpen ? 1 : 0, {
    config: defaultSpringConfig,
  });

  if (!rootElement) {
    return null;
  }

  if (!isOpen && !forceNotDetach) {
    return null;
  }

  return ReactDOM.createPortal(
    <div>
      <ModalChild
        transition={transition}
        isOpen={isOpen}
        close={close}
        align={align}
        maxHeight={maxHeight}
        onCloseTransitionEnd={() => {
          setForceNotDetach(false);

          if (onCloseTransitionEnd) {
            onCloseTransitionEnd();
          }
        }}
        forceNotUseSimplebar={forceNotUseSimplebar}
        forceNotOverflowAuto={forceNotOverflowAuto}
        disableBackdrop={disableBackdrop}
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
    align: "center" | "bottom" | "left" | "right";

    maxHeight?: string;

    onCloseTransitionEnd: () => void;
    forceNotUseSimplebar?: boolean;
    forceNotOverflowAuto?: boolean;
    disableBackdrop?: boolean;
  }>
> = ({
  children,
  transition,
  align,
  maxHeight,
  isOpen,
  close,
  onCloseTransitionEnd,
  forceNotUseSimplebar,
  forceNotOverflowAuto,
  disableBackdrop,
}) => {
  const onCloseTransitionEndRef = useRef(onCloseTransitionEnd);
  onCloseTransitionEndRef.current = onCloseTransitionEnd;
  useLayoutEffect(() => {
    if (isOpen) {
      transition.start(1);
    } else {
      transition.start(0, {
        onRest: onCloseTransitionEndRef.current,
      });
    }
  }, [transition, isOpen]);

  const innerContainerRef = useRef<HTMLDivElement>(null);

  const renderContainer = (
    ref: React.RefObject<HTMLDivElement>,
    style: React.ComponentProps<typeof AnimatedSimpleBar>["style"],
    children: any
  ) => {
    if (align === "left" || align === "right" || forceNotUseSimplebar) {
      // align left는 사실 sidebar로만 쓰이는데...
      // SimpleBar를 사용하면 height를 결정하기 힘든 문제가 있어서 대충 처리한다
      return (
        <animated.div ref={ref} style={style}>
          {children}
        </animated.div>
      );
    }

    return (
      <AnimatedSimpleBar
        scrollableNodeProps={{
          ref,
        }}
        style={style}
      >
        {children}
      </AnimatedSimpleBar>
    );
  };

  return (
    <animated.div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,

        ...(() => {
          if (align === "left" || align === "right") {
            return;
          }

          return {
            display: "flex",
            flexDirection: "column",

            justifyContent: align === "center" ? "center" : "flex-end",
          };
        })(),

        // root의 pointer events가 "none"으로 설정된다.
        // 하지만 backdrop 자체가 모든 화면을 채우기 때문에 여기서 pointer events를 로직에 따라 대체할 수 있다.
        // disableBackdrop 옵션에 따라서 선택한다.
        pointerEvents: disableBackdrop ? "none" : "auto",

        backgroundColor: disableBackdrop
          ? "rgba(0,0,0,0)"
          : transition.to((t) =>
              Color(ColorPalette["gray-550"])
                .alpha(t * 0.55)
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
      {renderContainer(
        innerContainerRef,
        {
          // 화면을 다 가릴수는 없게 만든다.
          // align이 left일때는 (사실은 sidebar에서만 left align이 사용됨)
          // 그냥 냅두고 알아서 처리하게 한다.
          maxHeight: !(align === "left" || align === "right")
            ? maxHeight || "85vh"
            : undefined,

          overflow: forceNotOverflowAuto ? undefined : "auto",

          // root의 pointer events가 "none"으로 설정된다.
          // 하지만 당연히 컨텐츠 자체는 pointer events를 받아야 하므로 여기서 "auto"로 설정한다.
          pointerEvents: "auto",

          position: "absolute",
          left: 0,
          right: 0,

          ...(() => {
            if (align === "left") {
              return {
                top: 0,
                bottom: 0,

                transform: transition.to(
                  (t) => `translateX(${(1 - t) * -100}%)`
                ),
              };
            }

            if (align === "right") {
              return {
                top: 0,
                bottom: 0,

                transform: transition.to(
                  (t) => `translateX(${(1 - t) * 100}%)`
                ),
              };
            }

            return {
              bottom:
                align === "center"
                  ? transition.to((t) => `${t * 50}%`)
                  : "auto",
              transform:
                align === "center"
                  ? // XXX: alignY가 "center"일때 세로로 중앙 정렬하기가 힘들다.
                    //      bottom을 50%로 하고 translateY를 50%로 하면 중앙 정렬이지만,
                    //      close가 끝나는 시점에서는 bottom이 0이고 translateY가 100%여야한다.
                    //      하지만 이걸 그대로 구현하면 실제로는 transition이 겹쳐서 이루어진 것으로
                    //      원래 의도된 트랜지션 그래프와는 달라진다.
                    //      근데 이걸 해결하려면 container와 children의 height를 계산해서 해야하는데
                    //      귀찮으니 일단 이렇게 처리하고 넘어간다.
                    //      어차피 사람은 못 느낄듯.
                    transition.to((t) => `translateY(${50 + (1 - t) * 50}%)`)
                  : transition.to((t) => `translateY(${(1 - t) * 100}%)`),
            };
          })(),
        },
        children
      )}
    </animated.div>
  );
};
