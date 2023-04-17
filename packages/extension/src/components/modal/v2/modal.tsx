import React, {
  FunctionComponent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useModalRoot } from "./internal";
import ReactDOM from "react-dom";
import {
  lock as lockScroll,
  unlock as unlockScroll,
} from "tua-body-scroll-lock";
import { animated, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../../styles/spring";
import { ModalProps } from "./types";
import Color from "color";

export const Modal: FunctionComponent<ModalProps> = ({
  isOpen,
  close,
  align,
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

  useLayoutEffect(() => {
    if (isOpen) {
      lockScroll(rootElement);

      return () => {
        unlockScroll(rootElement);
      };
    } else {
      unlockScroll(rootElement);
    }
  }, [isOpen, rootElement]);

  if (!rootElement) {
    return null;
  }

  if (!isOpen && !forceNotDetach) {
    return null;
  }

  return ReactDOM.createPortal(
    <div>
      <ModalChild
        isOpen={isOpen}
        close={close}
        align={align}
        onCloseTransitionEnd={() => {
          setForceNotDetach(false);
        }}
      >
        {children}
      </ModalChild>
    </div>,
    rootElement
  );
};

const ModalChild: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  align: "center" | "bottom" | "left";

  onCloseTransitionEnd: () => void;
}> = ({ children, align, isOpen, close, onCloseTransitionEnd }) => {
  const transition = useSpringValue(0, {
    config: defaultSpringConfig,
  });

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

  return (
    <animated.div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,

        ...(() => {
          if (align === "left") {
            return;
          }

          return {
            display: "flex",
            flexDirection: "column",

            justifyContent: align === "center" ? "center" : "flex-end",
          };
        })(),

        backgroundColor: transition.to((t) =>
          Color("#000000")
            .alpha(t * 0.55)
            .string()
        ),
      }}
      onClick={(e) => {
        e.preventDefault();
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
      <animated.div
        ref={innerContainerRef}
        style={{
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
        }}
      >
        {children}
      </animated.div>
    </animated.div>
  );
};
