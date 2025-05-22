import { animated, useSpringValue, to } from "@react-spring/web";
import { defaultSpringConfig } from "../../../../styles/spring";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Color from "color";
import { ColorPalette } from "../../../../styles";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Tooltip } from "../../../../components/tooltip";
import { Gutter } from "../../../../components/gutter";
import { Caption2 } from "../../../../components/typography";
import { FormattedMessage } from "react-intl";
import { useTheme } from "styled-components";

const pxToRem = (px: number) => {
  const base = parseFloat(
    getComputedStyle(document.documentElement).fontSize.replace("px", "")
  );
  return px / base;
};

const getCopyAddressButtonBackgroundColor = (theme: {
  mode: "dark" | "light";
}): string => {
  return theme.mode === "light"
    ? Color(ColorPalette["gray-10"]).alpha(0).toString()
    : Color(ColorPalette["gray-550"]).alpha(0).toString();
};

const getCopyAddressButtonHoverBackgroundColor = (theme: {
  mode: "dark" | "light";
}): string => {
  return theme.mode === "light"
    ? Color(ColorPalette["gray-100"]).alpha(0.5).toString()
    : ColorPalette["gray-450"];
};

export const CopyAddressButton: FunctionComponent<{
  address: string;

  parentIsHover: boolean;
}> = ({ address, parentIsHover }) => {
  // 구현이 좀 복잡해지고 읽기 어렵긴한데...
  // 머 별 중요한 컴포넌트는 아니니까 ㅋ;

  const INITIAL_COPY_ADDRESS_CONTAINER_SIZE = 20;

  const theme = useTheme();

  const [containerWidthRem, setContainerWidthRem] = useState(
    pxToRem(INITIAL_COPY_ADDRESS_CONTAINER_SIZE)
  );
  const [isAnimatingClick, setIsAnimatingClick] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const animatedOpacity = useSpringValue(0, {
    config: defaultSpringConfig,
  });
  const lastAnimatedOpacity = useRef(0);
  const animatedWidth = useSpringValue(containerWidthRem, {
    config: defaultSpringConfig,
  });
  const lastAnimatedWidth = useRef(containerWidthRem);
  const animatedBackgroundColor = useSpringValue(
    getCopyAddressButtonBackgroundColor(theme),
    {
      config: defaultSpringConfig,
    }
  );
  const lastAnimatedBackgroundColor = useRef(
    getCopyAddressButtonBackgroundColor(theme)
  );

  const seq = useRef(0);

  const [_, setAnimationStack] = useState<
    {
      id: string;

      type: "width" | "opacity" | "background";
      to: number | string;

      isAnimating: boolean;
      blockProceedingAnimations: boolean;

      onRest?: () => void;
    }[]
  >([]);

  // animateStack, pushAnimation는 컴포넌트 라이프사이클 동안 변하지 않아야 한다.
  // useRef으로도 할 수 있을 것 같기는한데 일단 useCallback으로 했다.
  // 이 함수들은 한번만 생성되고, 그 이후로는 변하지 않는다.
  // 그러므로 deps는 무조건 빈 배열 ([])이거나 변하지 않는 값들만 있어야한다.
  // 나머지 로직들은 이를 가정하고 짰기 때문에 이 가정이 틀려지면 전체적으로 로직을 다시 살펴봐야한다.
  const animateStack = useCallback(() => {
    setAnimationStack((prev) => {
      const blockAnimationIndex = prev.findIndex(
        (anim) => anim.blockProceedingAnimations
      );
      const notBlockedAnimations =
        blockAnimationIndex >= 0
          ? prev.slice(0, blockAnimationIndex + 1)
          : prev;

      const anims = notBlockedAnimations.filter((anim) => {
        return !anim.isAnimating;
      });

      if (anims.length > 0) {
        for (const anim of anims) {
          anim.isAnimating = true;
          const removeAnim = () => {
            setAnimationStack((prev) => {
              const index = prev.findIndex((a) => a.id === anim.id);
              if (index >= 0) {
                prev.splice(index, 1);
                return [...prev];
              } else {
                return prev;
              }
            });
          };
          const onRest = () => {
            if (anim.onRest) {
              anim.onRest();
            }

            removeAnim();
          };

          if (anim.type === "opacity") {
            const changed = lastAnimatedOpacity.current !== anim.to;
            if (changed) {
              animatedOpacity.start(anim.to as number, {
                onRest: onRest,
              });
            } else {
              removeAnim();
            }
            lastAnimatedOpacity.current = anim.to as number;
          } else if (anim.type === "width") {
            const changed = lastAnimatedWidth.current !== anim.to;
            if (changed) {
              animatedWidth.start(anim.to as number, {
                onRest: onRest,
              });
            } else {
              removeAnim();
            }
            lastAnimatedWidth.current = anim.to as number;
          } else if (anim.type === "background") {
            const changed = lastAnimatedBackgroundColor.current !== anim.to;
            if (changed) {
              animatedBackgroundColor.start(anim.to as string, {
                onRest: onRest,
              });
            } else {
              removeAnim();
            }
            lastAnimatedBackgroundColor.current = anim.to as string;
          }
        }

        return [...prev];
      } else {
        return prev;
      }
    });
  }, [animatedBackgroundColor, animatedOpacity, animatedWidth]);

  const pushAnimation = useCallback(
    (animation: {
      type: "width" | "opacity" | "background";
      to: number | string;

      blockProceedingAnimations?: boolean;

      onRest?: () => void;
    }) => {
      setAnimationStack((prev) => {
        prev.push({
          ...animation,
          id: (seq.current++).toString(),
          blockProceedingAnimations:
            animation.blockProceedingAnimations ?? false,
          isAnimating: false,
        });

        return [...prev];
      });

      animateStack();
    },
    [animateStack]
  );

  useEffect(() => {
    if (parentIsHover) {
      pushAnimation({
        type: "opacity",
        to: 1,
      });
    } else {
      pushAnimation({
        type: "opacity",
        to: 0,
      });
    }
  }, [parentIsHover, pushAnimation]);

  useEffect(() => {
    if (isHover || isAnimatingClick) {
      pushAnimation({
        type: "background",
        to: getCopyAddressButtonHoverBackgroundColor(theme),
      });
    } else {
      pushAnimation({
        type: "background",
        to: getCopyAddressButtonBackgroundColor(theme),
      });
    }
  }, [isAnimatingClick, isHover, pushAnimation, theme]);

  const resizeRef = useRef<HTMLDivElement | null>(null);

  const [resizeObserver] = useState(() => {
    return new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const boxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;

        const width = boxSize.inlineSize;
        setContainerWidthRem(pxToRem(width));
      }
    });
  });
  useEffect(() => {
    if (resizeRef.current) {
      const div = resizeRef.current;
      resizeObserver.observe(div, {});

      return () => {
        resizeObserver.unobserve(div);
      };
    }
  }, [resizeObserver]);

  // For animating when click
  const [clickAnimation, setClickAnimation] = useState(false);

  useEffect(() => {
    if (clickAnimation) {
      setIsAnimatingClick(true);
      pushAnimation({
        type: "width",
        to: containerWidthRem,
        blockProceedingAnimations: true,
      });

      const timeoutId = setTimeout(() => {
        setClickAnimation(false);
      }, 750);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      pushAnimation({
        type: "width",
        to: pxToRem(INITIAL_COPY_ADDRESS_CONTAINER_SIZE),
        onRest: () => {
          setIsAnimatingClick(false);
        },
      });
    }
  }, [clickAnimation, containerWidthRem, pushAnimation]);

  return (
    <Tooltip
      enabled={false}
      isAlwaysOpen={!isAnimatingClick && isHover}
      content={Bech32Address.shortenAddress(address, 36)}
    >
      <animated.div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          overflow: "hidden",
          cursor: "pointer",

          width: to(animatedWidth, (v) => `${v}rem`),
          height: pxToRem(INITIAL_COPY_ADDRESS_CONTAINER_SIZE) + "rem",
          opacity: animatedOpacity,

          borderRadius: "9999999px",
          backgroundColor: animatedBackgroundColor,
        }}
        onMouseEnter={() => {
          setIsHover(true);
        }}
        onMouseOver={() => {
          // onMouseOut에 대해서는 처리하지 않는다.
          // onMouseOver는 레이아웃에 변경에 의해서도 이벤트가 발생하기 때문에
          // 좀 디테일한 케이스를 처리하기 위해서 사용한다.
          // 근데 onMouseOut까지 하면 isHover 값이 여러가지 이유로 수시로 변해서...
          // 근데 hover out의 경우는 딱히 처리할 case가 보이지 않기 때문에
          // copy address가 별 중요한 기능은 아니기 때문에 문제를 해결하지 않고 그냥 생략한다.
          setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!isAnimatingClick) {
            setClickAnimation(true);

            navigator.clipboard.writeText(address);
          }
        }}
      >
        <div
          ref={resizeRef}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Gutter size="0.25rem" />
          <Caption2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
            style={{
              whiteSpace: "nowrap",
            }}
          >
            <FormattedMessage id="page.main.components.token-item.copy-address.copied" />
          </Caption2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              strokeLinecap="round"
              strokeWidth="1.371"
              d="M12 6H7.371C6.614 6 6 6.614 6 7.371V12"
            />
            <rect
              width="5.629"
              height="5.629"
              x="8.186"
              y="8.186"
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              strokeWidth="1.371"
              rx="0.686"
            />
          </svg>
        </div>
      </animated.div>
    </Tooltip>
  );
};
