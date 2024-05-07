import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import {
  autoUpdate,
  limitShift,
  offset,
  useFloating,
} from "@floating-ui/react";
import { autoPlacement, shift } from "@floating-ui/react-dom";
import { ColorPalette } from "../../../styles";
import { Box } from "../../box";
import { Subtitle3 } from "../../typography";
import Color from "color";

export interface FloatingDropdownItem {
  key: string;
  label: string;
  onSelect: () => void;
}

export interface FloatingDropdownProps {
  isOpen: boolean;
  close: () => void;

  items: FloatingDropdownItem[];
}

export const FloatingDropdown: FunctionComponent<
  PropsWithChildren<FloatingDropdownProps>
> = ({ children, isOpen, close, items }) => {
  const { x, y, strategy, refs } = useFloating({
    middleware: [
      autoPlacement({
        allowedPlacements: ["left", "right"],
      }),
      offset(({ rects }) => {
        return {
          mainAxis: -rects.reference.width,
          crossAxis: -(rects.reference.height - rects.floating.height) / 2,
        };
      }),
      shift({
        padding: 10,
        limiter: limitShift({
          // or a function which returns one
          offset: ({ rects }) => {
            return {
              mainAxis: rects.reference.height,
              crossAxis: rects.reference.width,
            };
          },
        }),
      }),
    ],
    whileElementsMounted: autoUpdate,
    open: isOpen,
  });

  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const floatingRef = refs.floating;
      if (
        floatingRef.current &&
        "contains" in floatingRef.current &&
        !floatingRef.current.contains(event.target as Node)
      ) {
        closeRef.current();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs.floating]);

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
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,

            backgroundColor: ColorPalette["gray-400"],
            borderRadius: "0.375rem",
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: Color(ColorPalette["gray-300"]).alpha(0.2).toString(),
          }}
        >
          {items.map((item, i) => {
            return (
              <React.Fragment key={item.key}>
                <Box
                  alignX="right"
                  alignY="center"
                  height="2.5rem"
                  paddingX="1rem"
                  paddingY="0.75rem"
                  cursor="pointer"
                  color={ColorPalette["white"]}
                  hover={{
                    color: ColorPalette["gray-200"],
                  }}
                  onClick={(e) => {
                    e.preventDefault();

                    item.onSelect();

                    close();
                  }}
                >
                  {/* 이 텍스트의 색은 hover 때문에 상위 Box에서 결정함 */}
                  <Subtitle3>{item.label}</Subtitle3>
                </Box>
                {i !== items.length - 1 ? (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: Color(ColorPalette["gray-300"])
                        .alpha(0.2)
                        .toString(),
                    }}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </React.Fragment>
  );
};
