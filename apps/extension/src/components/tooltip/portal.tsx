import React, {
  FunctionComponent,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  arrow,
  FloatingArrow,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import { autoPlacement, shift } from "@floating-ui/react-dom";
import { ColorPalette } from "../../styles";
import { Caption2 } from "../typography";
import { useTheme } from "styled-components";

// TODO: Replace Tooltip with below
export const PortalTooltip: FunctionComponent<
  PropsWithChildren<{
    enabled?: boolean;
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
  }>
> = ({
  enabled,
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
}) => {
  const [_isOpen, setIsOpen] = useState(false);
  const isOpen = _isOpen || isAlwaysOpen;

  const arrowRef = useRef<SVGSVGElement | null>(null);
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

  const floatingElement =
    content && (isAlwaysOpen || ((enabled == null || enabled) && isOpen)) ? (
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
    ) : null;

  return (
    <React.Fragment>
      <div
        ref={refs.setReference}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        {...getReferenceProps()}
      >
        {children}
      </div>
      {floatingElement ? createPortal(floatingElement, document.body) : null}
    </React.Fragment>
  );
};
