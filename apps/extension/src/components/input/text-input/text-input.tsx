import React, {
  forwardRef,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { TextInputProps } from "./types";
import { Styles } from "./styles";
import { Column, Columns } from "../../column";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";
import { Label } from "../label";

// eslint-disable-next-line react/display-name
export const TextInput = forwardRef<
  HTMLInputElement,
  TextInputProps &
    React.InputHTMLAttributes<HTMLInputElement> & {
      inputStyle?: React.CSSProperties;
    }
>(
  (
    {
      className,
      style,
      label,
      paragraph,
      error,
      rightLabel,
      left,
      right,
      bottom,
      textSuffix,
      isLoading,
      autoComplete,
      inputStyle,
      ...props
    },
    ref
  ) => {
    const widthCheckRef = useRef<HTMLSpanElement | null>(null);
    const [textWidth, setTextWidth] = useState<number | null>(null);
    useEffect(() => {
      if (widthCheckRef.current) {
        const resizeObserver = new ResizeObserver((entries) => {
          if (entries.length > 0) {
            const entry = entries[0];
            const boxSize = Array.isArray(entry.borderBoxSize)
              ? entry.borderBoxSize[0]
              : entry.borderBoxSize;

            const width = boxSize.inlineSize;
            setTextWidth(width);
          }
        });
        resizeObserver.observe(widthCheckRef.current);
        return () => resizeObserver.disconnect();
      }
    }, []);
    const inputWidthCheckRef = useRef<HTMLInputElement | null>(null);
    const [textInputWidth, setTextInputWidth] = useState<number | null>(null);
    useEffect(() => {
      if (inputWidthCheckRef.current) {
        const resizeObserver = new ResizeObserver((entries) => {
          if (entries.length > 0) {
            const entry = entries[0];
            const boxSize = Array.isArray(entry.contentBoxSize)
              ? entry.contentBoxSize[0]
              : entry.contentBoxSize;

            const width = boxSize.inlineSize;
            setTextInputWidth(width);
          }
        });
        resizeObserver.observe(inputWidthCheckRef.current);
        return () => resizeObserver.disconnect();
      }
    }, []);
    const suffixWidthCheckRef = useRef<HTMLDivElement | null>(null);
    const [suffixTextWidth, setSuffixTextWidth] = useState<number | null>(null);
    useEffect(() => {
      if (suffixWidthCheckRef.current) {
        const resizeObserver = new ResizeObserver((entries) => {
          if (entries.length > 0) {
            const entry = entries[0];
            const boxSize = Array.isArray(entry.borderBoxSize)
              ? entry.borderBoxSize[0]
              : entry.borderBoxSize;

            const width = boxSize.inlineSize;
            setSuffixTextWidth(width);
          }
        });
        resizeObserver.observe(suffixWidthCheckRef.current);
        return () => resizeObserver.disconnect();
      }
    }, []);

    return (
      <Styles.Container className={className} style={style}>
        <div
          style={{
            position: "relative",
            opacity: 0,
            visibility: "hidden",
          }}
        >
          <Styles.TextInputWidthChecker ref={widthCheckRef}>
            {props.value}
          </Styles.TextInputWidthChecker>
        </div>
        <Columns sum={1} alignY="center">
          {label ? <Label content={label} isLoading={isLoading} /> : null}
          <Column weight={1} />
          {rightLabel ? <Box>{rightLabel}</Box> : null}
        </Columns>

        <Styles.TextInputContainer
          paragraph={paragraph}
          error={error}
          disabled={props.disabled}
          errorBorder={props.errorBorder}
        >
          <Columns sum={1}>
            {/*
               left, right props이 변했을때 컴포넌트 자체의 구조가 바뀌면서 text input이 re-render되서 focus를 잃을 수 있다
               이 문제 때문에 컴포넌트의 render 구조를 유지하기 위해서 MockBox를 사용한다.
               쓸데없어 보이지만 중요한 친구임.
             */}
            <MockBox show={!!left}>
              <Box alignY="center" marginLeft="1rem">
                <Styles.Icon>
                  <Box>{left}</Box>
                </Styles.Icon>
              </Box>
            </MockBox>

            <Column weight={1}>
              <div style={{ position: "relative", display: "flex" }}>
                <Styles.TextInput
                  {...props}
                  style={inputStyle}
                  autoComplete={autoComplete || "off"}
                  paragraph={paragraph}
                  error={error}
                  ref={(r) => {
                    inputWidthCheckRef.current = r;
                    if (typeof ref === "function") {
                      ref(r);
                    } else if (ref) {
                      ref.current = r;
                    }
                  }}
                />
                <div
                  style={(() => {
                    if (suffixTextWidth == null || !textSuffix) {
                      return {
                        width: 0,
                        opacity: 0,
                      };
                    }
                    return {
                      width: suffixTextWidth + "px",
                    };
                  })()}
                />
                <Styles.TextSuffix
                  ref={suffixWidthCheckRef}
                  textWidth={(() => {
                    if (textWidth != null && textInputWidth != null) {
                      return Math.min(textWidth, textInputWidth);
                    }
                    if (textWidth != null) {
                      return textWidth;
                    }
                    if (textInputWidth != null) {
                      return textInputWidth;
                    }

                    return 0;
                  })()}
                >
                  {textSuffix}
                </Styles.TextSuffix>
              </div>
            </Column>

            <MockBox show={!!right}>
              <Box alignY="center" marginRight="1rem">
                <Styles.Icon>
                  <Box>{right}</Box>
                </Styles.Icon>
              </Box>
            </MockBox>
          </Columns>
        </Styles.TextInputContainer>

        {bottom}

        <VerticalResizeTransition transitionAlign="top">
          {error || paragraph ? (
            <Styles.SubText error={error} paragraph={paragraph}>
              {error || paragraph}
            </Styles.SubText>
          ) : null}
        </VerticalResizeTransition>
      </Styles.Container>
    );
  }
);

const MockBox: FunctionComponent<
  PropsWithChildren<{
    show: boolean;
  }>
> = ({ show, children }) => {
  if (!show) {
    return null;
  }
  return <React.Fragment>{children}</React.Fragment>;
};
