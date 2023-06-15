import React, { FunctionComponent, useRef, useState } from "react";
import {
  arrow,
  FloatingArrow,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import { ColorPalette } from "../../styles";
import { Caption2 } from "../typography";
import { autoPlacement, shift } from "@floating-ui/react-dom";

export const Tooltip: FunctionComponent<{
  enabled?: boolean;
  content?: string | React.ReactElement;
  isAlwaysOpen?: boolean;

  allowedPlacements?: ("top" | "bottom" | "left" | "right")[];
}> = ({
  enabled,
  content,
  isAlwaysOpen = false,
  allowedPlacements,
  children,
}) => {
  const [_isOpen, setIsOpen] = useState(false);
  const isOpen = _isOpen || isAlwaysOpen;

  const arrowRef = useRef(null);
  const { x, y, strategy, refs, context } = useFloating({
    middleware: [
      offset(9),
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
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

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

            backgroundColor: ColorPalette["gray-500"],
            padding: "0.625rem",
            borderRadius: "0.375rem",

            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: ColorPalette["gray-400"],

            zIndex: 9999999,
          }}
          {...getFloatingProps()}
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            fill={ColorPalette["gray-500"]}
            stroke={ColorPalette["gray-400"]}
            strokeWidth={1}
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
