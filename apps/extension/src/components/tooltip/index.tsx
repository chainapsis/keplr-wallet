import React, {
  FunctionComponent,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import {
  arrow,
  FloatingArrow,
  offset,
  safePolygon,
  size,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import { ColorPalette } from "../../styles";
import { Caption2 } from "../typography";
import { autoPlacement, shift } from "@floating-ui/react-dom";
import { useTheme } from "styled-components";

export const Tooltip: FunctionComponent<
  PropsWithChildren<{
    enabled?: boolean;
    containerStyle?: React.CSSProperties;
    content?: string | React.ReactElement;
    isAlwaysOpen?: boolean;

    allowedPlacements?: ("top" | "bottom" | "left" | "right")[];

    forceWidth?: string;
    hideArrow?: boolean;

    backgroundColor?: string;
    hideBorder?: boolean;
    borderColor?: string;
    filter?: string;
    floatingOffset?: number;

    // true면 hover가 늦게 닫히거나 마우스가 하위 컴포넌트와 툴팁 둘 다를 인식함.
    // 마우스를 통해서 툴팁 내용을 드래그 앤 카피 할 수 있도록 만듬.
    hoverCloseInteractive?: boolean;
  }>
> = ({
  enabled,
  containerStyle,
  content,
  isAlwaysOpen = false,
  allowedPlacements,
  backgroundColor: propBackgroundColor,
  hideBorder,
  borderColor: propBorderColor,
  filter,
  children,
  forceWidth,
  hideArrow,
  floatingOffset,
  hoverCloseInteractive,
}) => {
  const [_isOpen, setIsOpen] = useState(false);
  const isOpen = _isOpen || isAlwaysOpen;

  const arrowRef = useRef(null);
  const { x, y, strategy, refs, context } = useFloating({
    middleware: [
      offset(floatingOffset ?? 9),
      autoPlacement({
        allowedPlacements: allowedPlacements ?? ["top", "bottom"],
      }),
      shift({
        padding: 10,
      }),
      size({
        padding: 10,
        apply(size) {
          // Do things with the data, e.g.
          Object.assign(size.elements.floating.style, {
            maxWidth: `${size.availableWidth}px`,
          });
        },
      }),
      arrow({
        element: arrowRef,
      }),
    ],
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const hover = useHover(context, {
    enabled,
    // 살짝의 딜레이를 주면 더 안정적(선택 중 깜빡임 방지),
    ...(() => {
      if (hoverCloseInteractive) {
        return {
          delay: { close: 150 },
          handleClose: safePolygon({}),
        };
      }
      return {};
    })(),
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const theme = useTheme();

  const backgroundColor =
    propBackgroundColor ||
    (theme.mode === "light"
      ? ColorPalette["gray-400"]
      : ColorPalette["gray-500"]);

  const borderColor =
    propBorderColor ||
    (theme.mode === "light"
      ? ColorPalette["gray-400"]
      : ColorPalette["gray-400"]);

  return (
    <React.Fragment>
      <div
        ref={refs.setReference}
        style={{
          // 상위에 Box 컴포넌트가 있고 그 위에 세로로 정렬시키는 컴포넌트가 있을 경우
          // 밑의 스타일이 없으면 이 div의 height가 상위 컴포넌트를 다 채우는 height로 설정된다.
          // 이유는 모르겠는데 일단 이렇게 처리한다.
          display: "flex",
          flexDirection: "column",
          ...containerStyle,
        }}
        {...getReferenceProps()}
      >
        {children}
      </div>
      {content && (isAlwaysOpen || ((enabled == null || enabled) && isOpen)) ? (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,

            backgroundColor,
            padding: "0.625rem",
            borderRadius: "0.375rem",

            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: hideBorder ? backgroundColor : borderColor,

            filter,
            zIndex: 9999999,
            width: forceWidth,
          }}
          {...getFloatingProps()}
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            fill={backgroundColor}
            stroke={hideBorder ? backgroundColor : borderColor}
            strokeWidth={1}
            style={{
              display: hideArrow ? "none" : "block",
            }}
          />
          <Caption2
            style={{
              color: ColorPalette["white"],
            }}
          >
            {content}
          </Caption2>
        </div>
      ) : null}
    </React.Fragment>
  );
};
